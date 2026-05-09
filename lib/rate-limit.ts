const WINDOW_MS = 60_000 // 1 minute
const MAX_ATTEMPTS = 5

const attempts = new Map<string, number[]>()

export function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const window = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (window.length >= MAX_ATTEMPTS) return false
  window.push(now)
  attempts.set(ip, window)
  return true
}
