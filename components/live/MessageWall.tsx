import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"
import type { Tables } from "@/lib/supabase/database.types"

export function MessageWall({ messages }: { messages: Tables<"messages">[] }) {
  if (messages.length === 0) return null

  return (
    <section className="px-4 sm:px-6 py-8 max-w-2xl mx-auto w-full border-t border-white/[0.05]">
      <h2 className="text-[9px] tracking-[0.45em] uppercase text-white/25 font-mono mb-5">
        Nachrichten
      </h2>
      <div className="flex flex-col gap-2.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="rounded-lg px-4 py-3"
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span className="text-sm font-semibold text-white/75 truncate">
                {msg.author_name}
              </span>
              <span className="text-[10px] font-mono text-white/22 shrink-0">
                {formatDistanceToNow(new Date(msg.created_at), {
                  addSuffix: true,
                  locale: de,
                })}
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">{msg.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
