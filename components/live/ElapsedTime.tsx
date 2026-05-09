"use client"

import { useEffect, useState } from "react"

export function ElapsedTime({ raceStartedAt }: { raceStartedAt: string }) {
  const [elapsed, setElapsed] = useState(() => Date.now() - new Date(raceStartedAt).getTime())

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Date.now() - new Date(raceStartedAt).getTime())
    }, 1000)
    return () => clearInterval(id)
  }, [raceStartedAt])

  if (elapsed < 0) return null

  const totalSeconds = Math.floor(elapsed / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  const formatted =
    h > 0
      ? `${h}h ${String(m).padStart(2, "0")}min`
      : `${m}min ${String(s).padStart(2, "0")}s`

  return (
    <span className="text-[10px] font-mono tracking-widest text-white/25">
      seit {formatted}
    </span>
  )
}
