import { Countdown } from "./Countdown"
import { ConnectionIndicator } from "./ConnectionIndicator"
import { ElapsedTime } from "./ElapsedTime"
import { CurrentRound } from "./CurrentRound"
import { MilestoneProgress } from "./MilestoneProgress"
import { getStatusInfo } from "@/lib/utils/status"
import { EVENT_NAME, RUNNER_NAME, LAP_DISTANCE_KM, RACE_START_AT } from "@/lib/config"
import type { Tables } from "@/lib/supabase/database.types"

type Props = {
  runnerState: Tables<"runner_state"> | null
  lastStartedAt: string | null
  connectionStatus: "connecting" | "connected" | "error" | "reconnecting"
}

export function Hero({ runnerState, lastStartedAt, connectionStatus }: Props) {
  const status = runnerState?.current_status ?? "running"
  const { emoji, label, color } = getStatusInfo(status)
  const lapNumber = runnerState?.current_lap ?? 0
  const hasStarted = lapNumber > 0
  const totalKm = (lapNumber * LAP_DISTANCE_KM).toFixed(1)
  const raceStartedAt = runnerState?.race_started_at ?? RACE_START_AT.toISOString()

  const heroImageUrl = runnerState?.hero_image_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/lap-photos/${runnerState.hero_image_path}`
    : null

  return (
    <section className="relative min-h-[100svh] flex flex-col bg-[#0a0a0a] overflow-hidden select-none">
      {/* Crew photo — full-bleed background */}
      {heroImageUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImageUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ opacity: 0.35 }}
          />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.3) 40%, rgba(10,10,10,0.75) 80%, rgba(10,10,10,0.95) 100%)",
            }}
          />
        </>
      )}

      {/* Subtle grid texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-start justify-between px-5 sm:px-8 pt-6">
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] tracking-[0.4em] uppercase text-white/40 font-mono">
            Backyard Ultra
          </p>
          <p className="text-sm font-semibold tracking-wider text-white/60 uppercase leading-tight">
            {EVENT_NAME}
          </p>
        </div>
        <ConnectionIndicator status={connectionStatus} />
      </div>

      {/* Main */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 gap-5 py-10">
        <p className="text-[11px] tracking-[0.5em] uppercase text-white/45 font-mono">
          {RUNNER_NAME}
        </p>

        {/* Lap number — the hero element */}
        <div className="flex flex-col items-center -mt-2">
          <p className="text-[11px] tracking-[0.45em] uppercase text-white/40 font-mono mb-1">
            Runde
          </p>
          <CurrentRound lapNumber={lapNumber} raceStartedAt={raceStartedAt} status={status} />
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-3 mt-1">
          <span className="text-2xl leading-none" role="img" aria-label={label}>
            {emoji}
          </span>
          <span
            className="text-xs font-mono font-semibold tracking-[0.3em] uppercase"
            style={{ color }}
          >
            {label}
          </span>
        </div>

        {/* Souls Left */}
        {runnerState?.souls_left != null && (
          <div className="flex flex-col items-center gap-1 mt-1">
            <p className="text-[11px] tracking-[0.45em] uppercase text-white/45 font-mono">
              Souls Left
            </p>
            <p className="text-5xl font-black font-mono tabular-nums" style={{ color: "var(--accent)" }}>
              {runnerState.souls_left}
            </p>
          </div>
        )}

        {/* Countdown */}
        <div className="mt-1">
          <Countdown raceStartedAt={raceStartedAt} lastStartedAt={lastStartedAt} />
        </div>

        {/* Stats row */}
        {hasStarted && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3">
            <span className="text-[11px] font-mono tracking-widest text-white/40">{LAP_DISTANCE_KM} km / Runde</span>
            <span className="text-white/25">·</span>
            <span className="text-[11px] font-mono tracking-widest text-white/40">{totalKm} km gesamt</span>
            <span className="text-white/25">·</span>
            <ElapsedTime raceStartedAt={raceStartedAt} />
          </div>
        )}

        {/* Milestone progress — 24 Runden / 100 Meilen */}
        {hasStarted && (
          <div className="w-full flex justify-center px-8 mt-2">
            <MilestoneProgress lapNumber={lapNumber} />
          </div>
        )}
      </div>

      {/* Scroll hint */}
      <div className="relative z-10 flex justify-center pb-7" aria-hidden>
        <div className="flex flex-col items-center gap-2">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/15" />
          <p className="text-[10px] tracking-[0.4em] uppercase font-mono text-white/35">Feed</p>
        </div>
      </div>
    </section>
  )
}
