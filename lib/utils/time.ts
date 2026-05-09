import { addMinutes } from "date-fns"
import { LAP_DURATION_MINUTES, RACE_START_AT } from "@/lib/config"

export function getNextDeadline(lastStartedAt: string | null): Date {
  if (!lastStartedAt) return RACE_START_AT
  return addMinutes(new Date(lastStartedAt), LAP_DURATION_MINUTES)
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00"
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return "—"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}
