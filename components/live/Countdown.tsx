"use client"

import { useEffect, useState } from "react"
import { formatCountdown, getNextDeadline } from "@/lib/utils/time"
import { RACE_START_AT } from "@/lib/config"

export function Countdown({ lastStartedAt }: { lastStartedAt: string | null }) {
  const [remaining, setRemaining] = useState(() => {
    const deadline = lastStartedAt ? getNextDeadline(lastStartedAt) : RACE_START_AT
    return Math.max(0, deadline.getTime() - Date.now())
  })

  useEffect(() => {
    const deadline = lastStartedAt ? getNextDeadline(lastStartedAt) : RACE_START_AT

    function tick() {
      setRemaining(Math.max(0, deadline.getTime() - Date.now()))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lastStartedAt])

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
        className={`font-mono text-5xl sm:text-6xl font-bold tracking-tight ${isPulsing ? "animate-pulse" : ""}`}
      >
        {formatCountdown(remaining)}
      </span>
    </div>
  )
}
