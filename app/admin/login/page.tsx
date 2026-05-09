import type { SearchParams } from "next/dist/server/request/search-params"

interface Props {
  searchParams: Promise<SearchParams>
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams
  const error = params.error as string | undefined
  const from = (params.from as string | undefined)?.startsWith("/admin") ? (params.from as string) : "/admin"

  const errorMessage =
    error === "invalid"
      ? "Falsches Passwort."
      : error === "rate_limit"
        ? "Zu viele Versuche. Bitte 1 Minute warten."
        : null

  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        background: "var(--background)",
      }}
    >
      {/* Race-badge header */}
      <div
        style={{
          marginBottom: "3rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.25em",
            color: "var(--accent)",
            textTransform: "uppercase",
            marginBottom: "0.5rem",
          }}
        >
          Last One Standing Augsburg
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 10vw, 4rem)",
            fontWeight: 900,
            fontStyle: "italic",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "var(--foreground)",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Crew&nbsp;Panel
        </h1>
      </div>

      {/* Login card */}
      <div
        style={{
          width: "100%",
          maxWidth: "22rem",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "2rem",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        {errorMessage && (
          <div
            style={{
              marginBottom: "1.25rem",
              padding: "0.75rem 1rem",
              background: "rgba(255,80,80,0.08)",
              border: "1px solid rgba(255,80,80,0.25)",
              color: "#ff6b6b",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              letterSpacing: "0.01em",
            }}
          >
            {errorMessage}
          </div>
        )}

        <form method="POST" action="/api/admin/login" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Pass the redirect target so login API can send user back */}
          <input type="hidden" name="from" value={from} />

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label
              htmlFor="password"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              Passwort
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              autoFocus
              autoComplete="current-password"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1rem",
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${errorMessage ? "rgba(255,80,80,0.4)" : "rgba(255,255,255,0.12)"}`,
                color: "var(--foreground)",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                letterSpacing: "0.05em",
                WebkitAppearance: "none",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: "0.25rem",
              padding: "0.875rem 1rem",
              background: "var(--accent)",
              color: "#0a0a0a",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              width: "100%",
              lineHeight: 1,
            }}
          >
            Einloggen
          </button>
        </form>
      </div>

      {/* Footer label */}
      <p
        style={{
          marginTop: "2rem",
          fontFamily: "var(--font-sans)",
          fontSize: "0.7rem",
          color: "rgba(255,255,255,0.2)",
          letterSpacing: "0.05em",
        }}
      >
        Nur für Crew vor Ort
      </p>
    </main>
  )
}
