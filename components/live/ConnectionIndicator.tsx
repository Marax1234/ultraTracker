type Status = "connecting" | "connected" | "error"

export function ConnectionIndicator({ status }: { status: Status }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`size-2 rounded-full ${
          status === "connected"
            ? "bg-[#b8ff57] shadow-[0_0_8px_#b8ff57]"
            : status === "error"
              ? "bg-[#f59e0b] animate-pulse"
              : "bg-white/30 animate-pulse"
        }`}
      />
      <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-white/40">
        {status === "connected"
          ? "Live"
          : status === "error"
            ? "Verbindung unterbrochen"
            : "Verbinde..."}
      </span>
    </div>
  )
}
