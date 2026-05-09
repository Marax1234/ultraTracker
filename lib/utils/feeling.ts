import type { Enums } from "@/lib/supabase/database.types"

type LapFeeling = Enums<"lap_feeling">

export const FEELING_MAP: Record<LapFeeling, { emoji: string; label: string; color: string }> = {
  strong: { emoji: "💪", label: "Stark",  color: "#b8ff57" },
  good:   { emoji: "😊", label: "Gut",    color: "#60a5fa" },
  tough:  { emoji: "😮‍💨", label: "Zäh",    color: "#f59e0b" },
  rough:  { emoji: "😣", label: "Kämpft", color: "#f97316" },
}

export function getFeelingInfo(feeling: LapFeeling) {
  return FEELING_MAP[feeling]
}
