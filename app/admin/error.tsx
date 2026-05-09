"use client"

import { useEffect } from "react"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        gap: "1.25rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#ef4444",
        }}
      >
        Admin-Fehler
      </p>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.9rem",
          color: "rgba(255,255,255,0.5)",
          maxWidth: "22rem",
        }}
      >
        {error.message || "Etwas ist schiefgelaufen."}
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            padding: "0.75rem 1.25rem",
            minHeight: "48px",
            background: "var(--accent)",
            color: "#0a0a0a",
            border: "none",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontFamily: "var(--font-display)",
            fontSize: "0.8rem",
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Erneut versuchen
        </button>
        <a
          href="/admin/login"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0.75rem 1.25rem",
            minHeight: "48px",
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "0.375rem",
            fontFamily: "var(--font-display)",
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Neu anmelden
        </a>
      </div>
    </div>
  )
}
