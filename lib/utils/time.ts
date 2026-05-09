import { LAP_DURATION_MINUTES } from "@/lib/config"

export function getNextDeadline(raceStartedAt: string, lastStartedAt: string | null): Date {
  const start = new Date(raceStartedAt).getTime()
  const elapsed = Date.now() - start
  if (elapsed < 0) return new Date(start)
  const slotMs = LAP_DURATION_MINUTES * 60 * 1000
  const nextSlot = Math.ceil(elapsed / slotMs) * slotMs
  return new Date(start + nextSlot)
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
