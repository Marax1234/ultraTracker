const attempts = new Map<string, number[]>()

export function checkRateLimit(
  key: string,
  opts: { max?: number; windowMs?: number } = {}
): boolean {
  const max = opts.max ?? 5
  const windowMs = opts.windowMs ?? 60_000
  const now = Date.now()
  const window = (attempts.get(key) ?? []).filter((t) => now - t < windowMs)
  if (window.length >= max) return false
  window.push(now)
  attempts.set(key, window)
  return true
}
