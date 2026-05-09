import type { Enums } from "@/lib/supabase/database.types"

type RunnerStatus = Enums<"runner_status">

export const STATUS_MAP: Record<RunnerStatus, { emoji: string; label: string; color: string }> = {
  running:   { emoji: "🏃", label: "Unterwegs",     color: "#b8ff57" },
  resting:   { emoji: "😮‍💨", label: "Pause",          color: "#f59e0b" },
  struggling:{ emoji: "😣", label: "Kämpft",         color: "#f97316" },
  done:      { emoji: "🏁", label: "Ziel erreicht",  color: "#6b7280" },
}

export function getStatusInfo(status: RunnerStatus) {
  return STATUS_MAP[status] ?? STATUS_MAP.running
}
