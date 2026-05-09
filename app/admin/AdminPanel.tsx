"use client"

import { useTransition, useState, useRef, useEffect } from "react"
import { logLap, setStatus, setRaceStart, startRaceNow } from "./actions"
import { FEELING_MAP } from "@/lib/utils/feeling"
import { compressPhoto } from "@/lib/utils/photo-compress"
import { LAP_DURATION_MINUTES } from "@/lib/config"
import type { Enums } from "@/lib/supabase/database.types"

type LapFeeling = Enums<"lap_feeling">

interface Props {
  nextLapNumber: number
  raceStartedAt: string
}

function toDatetimeLocal(isoString: string): string {
  const d = new Date(isoString)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AdminPanel({ nextLapNumber, raceStartedAt }: Props) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const isPreRace = nextLapNumber === 1
  const [showRaceStart, setShowRaceStart] = useState(isPreRace)
  const [optimisticLap, setOptimisticLap] = useState(nextLapNumber)
  const [selectedFeeling, setSelectedFeeling] = useState<LapFeeling | null>(null)
  const [optimisticRaceStart, setOptimisticRaceStart] = useState(raceStartedAt)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const noteRef = useRef<HTMLTextAreaElement>(null)
  const raceStartInputRef = useRef<HTMLInputElement>(null)
  // Guards against double-tap during async photo compression (before isPending is set)
  const submittingRef = useRef(false)

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  const handleDone = () => {
    if (isActionPending || !raceHasStarted) return
    const fd = new FormData()
    fd.set("status", "done")
    startTransition(async () => {
      await setStatus(fd)
      showToast("success", "🏁 Rennen beendet")
    })
  }

  const handleLogLap = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isPending || submittingRef.current) return
    submittingRef.current = true

    const note = noteRef.current?.value?.trim() ?? ""
    const fd = new FormData()
    if (note) fd.set("note", note)
    if (selectedFeeling) fd.set("feeling", selectedFeeling)

    try {
      for (const file of selectedFiles) {
        try {
          const compressed = await compressPhoto(file)
          fd.append("photos", compressed, file.name)
        } catch {
          fd.append("photos", file, file.name)
        }
      }
    } finally {
      // Only reset if startTransition doesn't take over
      // (startTransition will keep submittingRef=true until resolved below)
    }

    startTransition(async () => {
      try {
        const result = await logLap(fd)
        if (result.error) {
          showToast("error", result.error)
        } else {
          const lapNum = optimisticLap
          if (noteRef.current) noteRef.current.value = ""
          setSelectedFiles([])
          if (fileInputRef.current) fileInputRef.current.value = ""
          setOptimisticLap(lapNum + 1)
          setSelectedFeeling(null)
          const msg = result.photoErrors?.length
            ? `Runde ${lapNum} ✓ — ${result.photoErrors.length} Foto-Fehler`
            : `Runde ${lapNum} abgeschlossen ✓`
          showToast(result.photoErrors?.length ? "error" : "success", msg)
        }
      } finally {
        submittingRef.current = false
      }
    })
  }

  const handleRaceStart = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isPending || submittingRef.current) return
    const fd = new FormData(e.currentTarget)
    const raw = fd.get("race_started_at") as string
    const newIso = new Date(raw).toISOString()
    setOptimisticRaceStart(newIso)
    startTransition(async () => {
      await setRaceStart(fd)
      showToast("success", "Startzeit gesetzt ✓")
      setShowRaceStart(false)
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 5)
    setSelectedFiles(files)
  }

  // Live clock — updates every second for unlock-time display
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const raceStartMs = new Date(optimisticRaceStart).getTime()
  const slotMs = LAP_DURATION_MINUTES * 60 * 1000
  const raceHasStarted = now >= raceStartMs
  const lapUnlockMs = raceStartMs + (optimisticLap - 1) * slotMs
  const lapAllowed = now >= lapUnlockMs

  const lapBlockReason = !raceHasStarted
    ? `Start: ${new Date(raceStartMs).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr`
    : !lapAllowed
      ? `Freischaltung: ${new Date(lapUnlockMs).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr`
      : null

  const isActionPending = isPending || submittingRef.current
  const isDisabled = isActionPending

  const raceStartDisplay = new Date(optimisticRaceStart).toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  })

  const feelingEntries = Object.entries(FEELING_MAP) as [LapFeeling, { emoji: string; label: string; color: string }][]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "420px", margin: "0 auto" }}>

      {/* Toast — role for screen readers */}
      {toast && (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          style={{
            position: "fixed", top: "3.75rem", left: "50%", transform: "translateX(-50%)",
            padding: "0.625rem 1.25rem", borderRadius: "0.375rem", zIndex: 100,
            background: toast.type === "success" ? "#14532d" : "#7f1d1d",
            border: `1px solid ${toast.type === "success" ? "#4ade80" : "#f87171"}`,
            color: "#fff", fontFamily: "var(--font-display)", fontSize: "0.95rem",
            fontWeight: 700, letterSpacing: "0.03em", whiteSpace: "nowrap",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Race start — prominent pre-race, collapsible once running */}
      <div style={{
        borderRadius: "0.5rem",
        border: isPreRace ? "1px solid rgba(184,255,87,0.25)" : "none",
        borderTop: isPreRace ? undefined : "1px solid rgba(255,255,255,0.06)",
        background: isPreRace ? "rgba(184,255,87,0.04)" : "transparent",
        padding: isPreRace ? "0.875rem" : "0.75rem 0 0",
      }}>
        <button
          onClick={() => setShowRaceStart(v => !v)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "0.25rem 0", minHeight: "44px", width: "100%", textAlign: "left",
            fontFamily: "var(--font-display)", fontSize: isPreRace ? "0.75rem" : "0.65rem",
            fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
            color: isPreRace ? "rgba(184,255,87,0.7)" : "rgba(255,255,255,0.3)",
            display: "flex", alignItems: "center", gap: "0.35rem",
          }}
        >
          {showRaceStart ? "▾" : "▸"}
          {isPreRace ? `⏱ Startzeit festlegen (${raceStartDisplay})` : `Offizieller Start (${raceStartDisplay})`}
        </button>

        {showRaceStart && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.625rem" }}>
            {/* Manual immediate start */}
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (isDisabled) return
                startTransition(async () => {
                  const result = await startRaceNow()
                  const nowIso = result.startedAt
                  setOptimisticRaceStart(nowIso)
                  showToast("success", "🏁 Rennen manuell gestartet!")
                  setShowRaceStart(false)
                })
              }}
              style={{
                width: "100%", minHeight: "52px", padding: "0.75rem",
                background: isDisabled ? "rgba(184,255,87,0.1)" : "rgba(184,255,87,0.18)",
                border: "1px solid rgba(184,255,87,0.4)", borderRadius: "0.375rem",
                cursor: isDisabled ? "not-allowed" : "pointer",
                fontFamily: "var(--font-display)", fontSize: "0.9rem",
                fontWeight: 900, fontStyle: "italic", textTransform: "uppercase", letterSpacing: "0.06em",
                color: isDisabled ? "rgba(184,255,87,0.4)" : "var(--accent)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              ⚡ Jetzt starten!
            </button>

            {/* Or set a specific time */}
            <p style={{
              fontFamily: "var(--font-display)", fontSize: "0.6rem", fontWeight: 700,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.25)", textAlign: "center", margin: 0,
            }}>oder Uhrzeit manuell setzen</p>

            <form onSubmit={handleRaceStart} style={{ display: "flex", gap: "0.5rem" }}>
              <input type="hidden" name="tz_offset_minutes" value={new Date().getTimezoneOffset()} />
              <input
                ref={raceStartInputRef}
                type="datetime-local"
                name="race_started_at"
                defaultValue={toDatetimeLocal(optimisticRaceStart)}
                style={{
                  flex: 1, background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0.375rem",
                  color: "var(--foreground)", fontFamily: "var(--font-sans)", fontSize: "0.85rem",
                  padding: "0.5rem 0.625rem", outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={isDisabled}
                style={{
                  minHeight: "44px", padding: "0.5rem 0.875rem",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "0.375rem",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-display)", fontSize: "0.75rem",
                  fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
                  color: "var(--foreground)",
                }}
              >
                Setzen
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Lap form */}
      <form onSubmit={handleLogLap} style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>

        {/* Feeling selector */}
        <div>
          <p style={{
            fontFamily: "var(--font-display)", fontSize: "0.65rem", fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)",
            margin: "0 0 0.5rem",
          }}>Wie lief die Runde?</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {feelingEntries.map(([feeling, info]) => {
              const active = selectedFeeling === feeling
              return (
                <button
                  key={feeling}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setSelectedFeeling(active ? null : feeling)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: "0.25rem",
                    minHeight: "64px", padding: "0.75rem",
                    background: active ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                    border: `2px solid ${active ? info.color : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "0.5rem", cursor: isDisabled ? "not-allowed" : "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <span style={{ fontSize: "1.625rem", lineHeight: 1 }} aria-hidden="true">{info.emoji}</span>
                  <span style={{
                    fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    color: active ? info.color : "var(--foreground)",
                    transition: "color 0.15s",
                  }}>{info.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <textarea
          ref={noteRef}
          placeholder="Notiz zur Runde (optional)"
          maxLength={280}
          rows={3}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "0.375rem", color: "var(--foreground)",
            fontFamily: "var(--font-sans)", fontSize: "0.9rem", lineHeight: 1.5,
            padding: "0.75rem", resize: "none", outline: "none",
          }}
        />

        {/* Photo picker */}
        <div>
          <input
            ref={fileInputRef}
            id="photo-input"
            type="file"
            multiple
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            aria-label="Bis zu 5 Fotos der Runde hinzufügen"
            style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
          />
          <label
            htmlFor="photo-input"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              padding: "0.75rem", width: "100%", boxSizing: "border-box", minHeight: "56px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "0.375rem", cursor: "pointer",
              fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700,
              letterSpacing: "0.05em", textTransform: "uppercase",
              color: selectedFiles.length > 0 ? "var(--accent)" : "rgba(255,255,255,0.4)",
            }}
          >
            <span aria-hidden="true">📷</span>{" "}
            {selectedFiles.length > 0
              ? `${selectedFiles.length} Foto${selectedFiles.length > 1 ? "s" : ""} gewählt`
              : "Fotos hinzufügen (max. 5)"}
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isActionPending || !lapAllowed || !raceHasStarted}
          style={{
            width: "100%", minHeight: "68px", padding: "1rem",
            background: (isActionPending || !lapAllowed || !raceHasStarted)
              ? "rgba(184,255,87,0.15)"
              : "var(--accent)",
            border: lapBlockReason ? "1px solid rgba(184,255,87,0.2)" : "none",
            borderRadius: "0.5rem",
            cursor: (isActionPending || !lapAllowed || !raceHasStarted) ? "not-allowed" : "pointer",
            fontFamily: "var(--font-display)",
            fontSize: lapBlockReason ? "clamp(0.75rem, 3vw, 0.9rem)" : "clamp(1.1rem, 5vw, 1.4rem)",
            fontWeight: 900, fontStyle: "italic", letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: lapBlockReason ? "rgba(184,255,87,0.45)" : "#0a0a0a",
            transition: "background 0.15s",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {isActionPending
            ? "⏳ Wird gespeichert …"
            : lapBlockReason
              ? `🔒 ${lapBlockReason}`
              : `Runde ${optimisticLap} abschließen`}
        </button>
      </form>

      {/* Race over */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.75rem" }}>
        <button
          disabled={isActionPending || !raceHasStarted}
          onClick={handleDone}
          style={{
            width: "100%", minHeight: "52px", padding: "0.75rem",
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.25)", borderRadius: "0.5rem",
            cursor: isDisabled ? "not-allowed" : "pointer",
            fontFamily: "var(--font-display)", fontSize: "0.85rem",
            fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "rgba(239,68,68,0.7)",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          🏁 Rennen beendet
        </button>
      </div>

    </div>
  )
}
