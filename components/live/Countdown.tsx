"use client"

import { useEffect, useState } from "react"
import { formatCountdown, getNextDeadline } from "@/lib/utils/time"

type Props = { raceStartedAt: string; lastStartedAt: string | null }

export function Countdown({ raceStartedAt, lastStartedAt }: Props) {
  const [remaining, setRemaining] = useState(() => {
    const deadline = getNextDeadline(raceStartedAt, lastStartedAt)
    return Math.max(0, deadline.getTime() - Date.now())
  })

  useEffect(() => {
    function tick() {
      const deadline = getNextDeadline(raceStartedAt, lastStartedAt)
      setRemaining(Math.max(0, deadline.getTime() - Date.now()))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [raceStartedAt, lastStartedAt])

  const minutes = remaining / 60000
  const color =
    remaining <= 0
      ? "#ef4444"
      : minutes < 2
        ? "#ef4444"
        : minutes < 10
          ? "#f59e0b"
          : "#b8ff57"
  const isPulsing = remaining > 0 && minutes < 2

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[10px] tracking-[0.35em] uppercase text-white/30 font-mono">
        {lastStartedAt ? "Verbleibend" : "Start in"}
      </p>
      <span
        style={{ color, fontVariantNumeric: "tabular-nums" }}
        className={`font-mono text-5xl sm:text-6xl font-bold tracking-tight ${isPulsing ? "motion-safe:animate-pulse" : ""}`}
      >
        {formatCountdown(remaining)}
      </span>
    </div>
  )
}
