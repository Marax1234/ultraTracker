"use client"

import { useEffect } from "react"

export default function GlobalError({
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
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "var(--background)",
        color: "var(--foreground)",
        gap: "1.5rem",
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
        Fehler
      </p>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.9rem",
          color: "rgba(255,255,255,0.5)",
          maxWidth: "24rem",
        }}
      >
        {error.message || "Ein unerwarteter Fehler ist aufgetreten."}
      </p>
      <button
        onClick={reset}
        style={{
          padding: "0.75rem 1.5rem",
          minHeight: "48px",
          background: "var(--accent)",
          color: "#0a0a0a",
          border: "none",
          borderRadius: "0.375rem",
          cursor: "pointer",
          fontFamily: "var(--font-display)",
          fontSize: "0.85rem",
          fontWeight: 800,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Erneut versuchen
      </button>
      <a
        href="/"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.8rem",
          color: "rgba(255,255,255,0.3)",
          textDecoration: "underline",
        }}
      >
        Zur Startseite
      </a>
    </div>
  )
}
