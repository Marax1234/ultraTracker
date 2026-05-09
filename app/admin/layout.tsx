export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column", background: "var(--background)" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.25rem",
          height: "3.25rem",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.015)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <span
            style={{
              display: "inline-block",
              width: "0.5rem",
              height: "0.5rem",
              borderRadius: "50%",
              background: "var(--accent)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--foreground)",
              lineHeight: 1,
            }}
          >
            Crew Panel
          </span>
        </div>

        <form method="POST" action="/api/admin/logout">
          <button
            type="submit"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              background: "none",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              padding: "0.375rem 0.875rem",
              minHeight: "44px",
              lineHeight: 1,
            }}
          >
            Logout
          </button>
        </form>
      </header>

      <main style={{ flex: 1, padding: "1.5rem 1.25rem" }}>
        {children}
      </main>
    </div>
  )
}
