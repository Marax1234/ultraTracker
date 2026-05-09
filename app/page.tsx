import { createClient } from "@/lib/supabase/server"
import { LiveDashboard } from "@/components/live/LiveDashboard"
import type { Tables } from "@/lib/supabase/database.types"

type LapWithPhotos = Tables<"laps"> & { photos: Tables<"photos">[] }

export default async function Home() {
  const supabase = await createClient()

  const [{ data: runnerState }, { data: lapsData }, { data: messages }] =
    await Promise.all([
      supabase.from("runner_state").select().limit(1).maybeSingle(),
      supabase
        .from("laps")
        .select()
        .order("lap_number", { ascending: false })
        .limit(50),
      supabase
        .from("messages")
        .select()
        .order("created_at", { ascending: false })
        .limit(50),
    ])

  const laps = lapsData ?? []
  const lapIds = laps.map((l) => l.id)

  const photosMap: Record<string, Tables<"photos">[]> = {}
  if (lapIds.length > 0) {
    const { data: photos } = await supabase
      .from("photos")
      .select()
      .in("lap_id", lapIds)
    for (const p of photos ?? []) {
      photosMap[p.lap_id] ??= []
      photosMap[p.lap_id].push(p)
    }
  }

  const lapsWithPhotos: LapWithPhotos[] = laps.map((l) => ({
    ...l,
    photos: photosMap[l.id] ?? [],
  }))

  return (
    <LiveDashboard
      initial={{
        runnerState: runnerState ?? null,
        laps: lapsWithPhotos,
        messages: messages ?? [],
      }}
    />
  )
}
