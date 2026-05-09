"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Enums } from "@/lib/supabase/database.types"

export async function setStatus(formData: FormData) {
  await requireAdmin()
  const status = formData.get("status") as Enums<"runner_status">
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
  const iso = new Date(raw).toISOString()
  const admin = createAdminClient()
  await admin
    .from("runner_state")
    .update({ race_started_at: iso, updated_at: new Date().toISOString() })
    .eq("id", 1)
  revalidatePath("/admin")
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
  const started_at = new Date(raceStartMs + (lap_number - 1) * 3600 * 1000).toISOString()
  const completed_at = new Date().toISOString()
  const note = (formData.get("note") as string | null)?.trim() || null

  const { data: lap, error: lapError } = await admin
    .from("laps")
    .insert({ lap_number, started_at, completed_at, note })
    .select("id")
    .single()

  if (lapError || !lap) {
    return { error: lapError?.message ?? "Lap-Insert fehlgeschlagen" }
  }

  await admin
    .from("runner_state")
    .update({ current_lap: lap_number, updated_at: new Date().toISOString() })
    .eq("id", 1)

  const photoFiles = formData.getAll("photos") as File[]
  const photoErrors: string[] = []

  for (let idx = 0; idx < photoFiles.length; idx++) {
    const file = photoFiles[idx]
    if (!file || file.size === 0) continue

    const path = `lap-${lap_number}-${Date.now()}-${idx}.jpg`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await admin.storage
      .from("lap-photos")
      .upload(path, buffer, { contentType: "image/jpeg", upsert: false })

    if (uploadError) {
      photoErrors.push(`Foto ${idx + 1}: ${uploadError.message}`)
      continue
    }

    await admin.from("photos").insert({ lap_id: lap.id, storage_path: path })
  }

  revalidatePath("/admin")
  return photoErrors.length > 0 ? { photoErrors } : {}
}
