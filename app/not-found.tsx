import Link from "next/link"

export default function NotFound() {
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
          color: "rgba(255,255,255,0.25)",
        }}
      >
        404
      </p>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.9rem",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        Seite nicht gefunden
      </p>
      <Link
        href="/"
        style={{
          padding: "0.75rem 1.5rem",
          background: "var(--accent)",
          color: "#0a0a0a",
          borderRadius: "0.375rem",
          fontFamily: "var(--font-display)",
          fontSize: "0.85rem",
          fontWeight: 800,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          textDecoration: "none",
        }}
      >
        Zum Live-Tracker
      </Link>
    </div>
  )
}
