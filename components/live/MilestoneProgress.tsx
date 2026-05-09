"use client"

import { LAP_DISTANCE_KM } from "@/lib/config"

const TARGET_LAPS = 24
const KM_PER_MILE = 1.60934

export function MilestoneProgress({ lapNumber }: { lapNumber: number }) {
  const pct = Math.min(100, (lapNumber / TARGET_LAPS) * 100)
  const totalKm = lapNumber * LAP_DISTANCE_KM
  const totalMiles = totalKm / KM_PER_MILE
  const done = pct >= 100

  return (
    <div style={{ width: "100%", maxWidth: "300px" }}>
      <style>{`
        @keyframes _ms_expand {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        ._ms_fill {
          transform-origin: left center;
          animation: _ms_expand 1.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes _ms_pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        ._ms_dot {
          animation: _ms_pulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Header labels */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "7px" }}>
        <span style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "8px",
          letterSpacing: "0.38em",
          textTransform: "uppercase",
          color: done ? "rgba(184,255,87,0.5)" : "rgba(255,255,255,0.2)",
        }}>
          Tag 1 · 24 Runden
        </span>
        <span style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "8px",
          letterSpacing: "0.38em",
          textTransform: "uppercase",
          color: done ? "rgba(184,255,87,0.5)" : "rgba(255,255,255,0.2)",
        }}>
          100 Meilen
        </span>
      </div>

      {/* Bar track */}
      <div style={{ position: "relative", height: "2px", background: "rgba(255,255,255,0.07)", borderRadius: "1px" }}>
        {/* Halfway tick */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "1px",
          height: "8px",
          background: "rgba(255,255,255,0.1)",
        }} />

        {/* Filled portion */}
        <div
          className="_ms_fill"
          style={{
            position: "absolute",
            inset: 0,
            right: "auto",
            width: `${pct}%`,
            background: done
              ? "rgba(184,255,87,1)"
              : "linear-gradient(90deg, rgba(184,255,87,0.6) 0%, rgba(184,255,87,1) 100%)",
            boxShadow: done
              ? "0 0 12px rgba(184,255,87,0.7)"
              : "0 0 8px rgba(184,255,87,0.45)",
            borderRadius: "1px",
          }}
        />

        {/* Leading dot — only while in progress */}
        {pct > 2 && !done && (
          <div
            className="_ms_dot"
            style={{
              position: "absolute",
              top: "50%",
              left: `${pct}%`,
              transform: "translate(-50%, -50%)",
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "rgba(184,255,87,1)",
              boxShadow: "0 0 10px rgba(184,255,87,0.9), 0 0 20px rgba(184,255,87,0.4)",
            }}
          />
        )}

        {/* Done checkmark at end */}
        {done && (
          <div style={{
            position: "absolute",
            right: "-10px",
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "9px",
            color: "rgba(184,255,87,0.9)",
          }}>
            ✓
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "7px" }}>
        <span style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "9px",
          letterSpacing: "0.12em",
          color: done ? "rgba(184,255,87,0.7)" : "rgba(184,255,87,0.45)",
          fontWeight: 700,
        }}>
          {lapNumber}&thinsp;/&thinsp;{TARGET_LAPS}
          <span style={{ opacity: 0.55, marginLeft: "0.45em", fontWeight: 400 }}>
            {pct.toFixed(pct < 10 ? 1 : 0)}%
          </span>
        </span>
        <span style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "9px",
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.18)",
        }}>
          {totalMiles.toFixed(1)}&thinsp;mi&ensp;·&ensp;{totalKm.toFixed(1)}&thinsp;km
        </span>
      </div>
    </div>
  )
}
