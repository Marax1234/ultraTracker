type Status = "connecting" | "connected" | "error" | "reconnecting"

export function ConnectionIndicator({ status }: { status: Status }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`size-2 rounded-full ${
          status === "connected"
            ? "bg-[#b8ff57] shadow-[0_0_8px_#b8ff57]"
            : status === "error"
              ? "bg-[#ef4444] motion-safe:animate-pulse"
              : status === "reconnecting"
                ? "bg-[#f59e0b] motion-safe:animate-pulse"
                : "bg-white/30 motion-safe:animate-pulse"
        }`}
      />
      <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-white/40">
        {status === "connected"
          ? "Live"
          : status === "error"
            ? "Verbindung unterbrochen"
            : status === "reconnecting"
              ? "Verbinde neu…"
              : "Verbinde..."}
      </span>
      {status === "error" && (
        <button
          onClick={() => window.location.reload()}
          className="text-[10px] tracking-[0.2em] uppercase font-mono text-white/30 hover:text-white/60 underline underline-offset-2 transition-colors ml-1"
        >
          Neu laden
        </button>
      )}
    </div>
  )
}
