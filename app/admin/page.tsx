import { createAdminClient } from "@/lib/supabase/admin"
import AdminPanel from "./AdminPanel"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const admin = createAdminClient()

  const [{ data: state }, { data: prevLap }] = await Promise.all([
    admin.from("runner_state").select("*").eq("id", 1).single(),
    admin.from("laps").select("lap_number").order("lap_number", { ascending: false }).limit(1).maybeSingle(),
  ])

  const nextLapNumber = (prevLap?.lap_number ?? 0) + 1

  return (
    <AdminPanel
      nextLapNumber={nextLapNumber}
      currentStatus={state?.current_status ?? "running"}
      raceStartedAt={state?.race_started_at ?? "2026-05-09T13:00:00.000Z"}
    />
  )
}
