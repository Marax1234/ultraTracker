"use client"

import { useEffect, useState } from "react"
import { LAP_DURATION_MINUTES } from "@/lib/config"
import type { Enums } from "@/lib/supabase/database.types"

type Props = {
  lapNumber: number
  raceStartedAt: string
  status: Enums<"runner_status">
}

export function CurrentRound({ lapNumber, raceStartedAt, status }: Props) {
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const slotMs = LAP_DURATION_MINUTES * 60 * 1000
  const raceStartMs = new Date(raceStartedAt).getTime()
  const nextRoundStartMs = raceStartMs + lapNumber * slotMs
  const isDone = status === "done"
  const displayRound = isDone || now < nextRoundStartMs ? lapNumber : lapNumber + 1
  const active = displayRound > 0

  return (
    <div
      aria-label={active ? `Runde ${displayRound}` : undefined}
      style={{
        fontSize: "clamp(9rem, 32vw, 20rem)",
        lineHeight: 0.82,
        fontVariantNumeric: "tabular-nums",
        fontWeight: 900,
        fontStyle: "italic",
        fontFamily: "var(--font-barlow-condensed), var(--font-geist-sans), sans-serif",
        color: active ? "#ededed" : "rgba(255,255,255,0.1)",
        letterSpacing: "-0.03em",
      }}
    >
      {active ? displayRound : "—"}
    </div>
  )
}
