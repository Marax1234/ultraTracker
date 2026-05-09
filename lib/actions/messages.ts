"use server"

import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import type { Tables } from "@/lib/supabase/database.types"

export type PostMessageResult =
  | { ok: true; message?: Tables<"messages"> }
  | { ok: false; error: string }

export async function postMessage(formData: FormData): Promise<PostMessageResult> {
  // Honeypot — stilles Verwerfen, kein Error
  const honeypot = (formData.get("website") ?? "") as string
  if (honeypot.length > 0) return { ok: true }

  // Mindest-Delay seit Pageload (5 s)
  const loadedAt = parseInt((formData.get("loadedAt") ?? "0") as string, 10)
  if (isNaN(loadedAt) || Date.now() - loadedAt < 5_000) return { ok: true }

  const name = ((formData.get("name") ?? "") as string).trim().slice(0, 40)
  const body = ((formData.get("body") ?? "") as string).trim().slice(0, 280)

  if (!name) return { ok: false, error: "Name darf nicht leer sein" }
  if (!body) return { ok: false, error: "Nachricht darf nicht leer sein" }

  const hdrs = await headers()
  const forwarded = hdrs.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown"

  if (!checkRateLimit("msg:" + ip, { max: 5, windowMs: 60_000 })) {
    return { ok: false, error: "Zu viele Nachrichten — kurz warten." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("messages")
    .insert({ author_name: name, body })
    .select()
    .single()

  if (error || !data) {
    return { ok: false, error: "Konnte Nachricht nicht senden" }
  }

  return { ok: true, message: data }
}
