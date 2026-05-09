export default function AdminPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60svh",
        gap: "1rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}
      >
        Sprint 4
      </p>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 8vw, 3.5rem)",
          fontWeight: 900,
          fontStyle: "italic",
          textTransform: "uppercase",
          color: "var(--foreground)",
          lineHeight: 1,
          margin: 0,
        }}
      >
        Admin-Panel
        <br />
        folgt hier
      </h2>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.85rem",
          color: "rgba(255,255,255,0.3)",
          maxWidth: "20rem",
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        Runden loggen, Status setzen und Foto-Upload kommen in Sprint 4.
      </p>
    </div>
  )
}
