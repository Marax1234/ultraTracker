import { createAdminClient } from "@/lib/supabase/admin"
import { RACE_START_AT } from "@/lib/config"
import AdminPanel from "./AdminPanel"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const admin = createAdminClient()

  const [{ data: state }, { data: prevLap }] = await Promise.all([
    admin.from("runner_state").select("*").eq("id", 1).single(),
    admin.from("laps").select("lap_number").order("lap_number", { ascending: false }).limit(1).maybeSingle(),
  ])

  const nextLapNumber = (prevLap?.lap_number ?? 0) + 1

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  return (
    <AdminPanel
      nextLapNumber={nextLapNumber}
      raceStartedAt={state?.race_started_at ?? RACE_START_AT.toISOString()}
      initialSoulsLeft={state?.souls_left ?? null}
      initialHeroImagePath={state?.hero_image_path ?? null}
      supabaseUrl={supabaseUrl}
    />
  )
}
