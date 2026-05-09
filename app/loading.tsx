export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        background: "var(--background)",
      }}
    >
      {/* Hero skeleton */}
      <div
        style={{
          height: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2rem",
        }}
      >
        <div
          style={{
            width: "6rem",
            height: "8rem",
            borderRadius: "0.5rem",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            width: "10rem",
            height: "1.5rem",
            borderRadius: "0.25rem",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div
          style={{
            width: "7rem",
            height: "4rem",
            borderRadius: "0.25rem",
            background: "rgba(255,255,255,0.04)",
          }}
        />
      </div>
    </div>
  )
}
