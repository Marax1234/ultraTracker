"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { LAP_DURATION_MINUTES } from "@/lib/config"
import type { Enums } from "@/lib/supabase/database.types"


export async function setStatus(formData: FormData) {
  await requireAdmin()
  const status = formData.get("status") as Enums<"runner_status">

  if (status === "done") {
    const admin = createAdminClient()
    const { data: state } = await admin.from("runner_state").select("race_started_at").eq("id", 1).single()
    if (state && Date.now() < new Date(state.race_started_at).getTime()) {
      return
    }
  }

  const admin = createAdminClient()
  await admin
    .from("runner_state")
    .update({ current_status: status, updated_at: new Date().toISOString() })
    .eq("id", 1)
  revalidatePath("/admin")
}

export async function setRaceStart(formData: FormData) {
  await requireAdmin()
  const raw = formData.get("race_started_at") as string
  // datetime-local has no timezone — browser sends local time as a naive string.
  // The server (UTC) would misparse it. The client adds tz_offset_minutes
  // (= getTimezoneOffset(), negative for UTC+ zones) so we can reconstruct UTC.
  const tzOffsetMinutes = parseInt(formData.get("tz_offset_minutes") as string || "0")
  const naiveMs = new Date(raw).getTime() // parsed as UTC on server
  const iso = new Date(naiveMs + tzOffsetMinutes * 60 * 1000).toISOString()
  const admin = createAdminClient()
  await admin
    .from("runner_state")
    .update({ race_started_at: iso, updated_at: new Date().toISOString() })
    .eq("id", 1)
  revalidatePath("/admin")
}

export async function startRaceNow() {
  await requireAdmin()
  const now = new Date().toISOString()
  const admin = createAdminClient()
  await admin
    .from("runner_state")
    .update({ race_started_at: now, updated_at: now })
    .eq("id", 1)
  revalidatePath("/admin")
  return { startedAt: now }
}

export type LogLapResult = { error?: string; photoErrors?: string[] }

export async function logLap(formData: FormData): Promise<LogLapResult> {
  await requireAdmin()
  const admin = createAdminClient()

  const { data: state, error: stateError } = await admin
    .from("runner_state")
    .select("*")
    .eq("id", 1)
    .single()

  if (stateError || !state) {
    return { error: "runner_state nicht gefunden" }
  }

  const { data: prevLap } = await admin
    .from("laps")
    .select("lap_number")
    .order("lap_number", { ascending: false })
    .limit(1)
    .maybeSingle()

  const lap_number = (prevLap?.lap_number ?? 0) + 1
  const raceStartMs = Date.parse(state.race_started_at)
  const now = Date.now()
  const slotMs = LAP_DURATION_MINUTES * 60 * 1000

  // Guard: race must have started
  if (now < raceStartMs) {
    const startTime = new Date(raceStartMs).toLocaleString("de-DE", {
      hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin",
    })
    return { error: `Rennen startet erst um ${startTime} Uhr` }
  }

  // Guard: lap N can only be logged once its hour-slot has started (T0 + (N-1)*60min)
  const unlockMs = raceStartMs + (lap_number - 1) * slotMs
  if (now < unlockMs) {
    const unlockTime = new Date(unlockMs).toLocaleString("de-DE", {
      hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin",
    })
    return { error: `Runde ${lap_number} erst ab ${unlockTime} Uhr möglich` }
  }

  const started_at = new Date(raceStartMs + (lap_number - 1) * slotMs).toISOString()
  const note = (formData.get("note") as string | null)?.trim() || null
  const feelingRaw = formData.get("feeling") as string | null
  const feeling = feelingRaw || null

  // completed_at omitted — DB DEFAULT now() is the source of truth for server time
  const { data: lap, error: lapError } = await admin
    .from("laps")
    .insert({ lap_number, started_at, note, feeling: feeling as Enums<"lap_feeling"> | null })
    .select("id")
    .single()

  if (lapError) {
    // UNIQUE constraint violation = concurrent duplicate tap
    if (lapError.code === "23505") {
      return { error: `Runde ${lap_number} wurde bereits geloggt` }
    }
    return { error: lapError.message }
  }
  if (!lap) {
    return { error: "Lap-Insert fehlgeschlagen" }
  }

  await admin
    .from("runner_state")
    .update({ current_lap: lap_number, updated_at: new Date().toISOString() })
    .eq("id", 1)

  const photoFiles = formData.getAll("photos") as File[]

  // Upload all photos in parallel; individual failures don't abort the lap
  const uploadResults = await Promise.all(
    photoFiles.map(async (file, idx) => {
      if (!file || file.size === 0) return null
      const path = `lap-${lap_number}-${Date.now()}-${idx}.jpg`
      const buffer = Buffer.from(await file.arrayBuffer())
      const { error: uploadError } = await admin.storage
        .from("lap-photos")
        .upload(path, buffer, { contentType: "image/jpeg", upsert: false })
      if (uploadError) return `Foto ${idx + 1}: ${uploadError.message}`
      await admin.from("photos").insert({ lap_id: lap.id, storage_path: path })
      return null
    })
  )

  const photoErrors = uploadResults.filter((r): r is string => r !== null)
  revalidatePath("/admin")
  return photoErrors.length > 0 ? { photoErrors } : {}
}
