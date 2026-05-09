"use client"

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"
import type { Tables } from "@/lib/supabase/database.types"
import { postMessage } from "@/lib/actions/messages"

type Message = Tables<"messages">

export function MessageWall({
  messages,
  onMessagePosted,
}: {
  messages: Message[]
  onMessagePosted: (msg: Message) => void
}) {
  const [pendingMessages, setPendingMessages] = useState<Message[]>([])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [bodyCount, setBodyCount] = useState(0)
  const loadedAtRef = useRef<number>(0)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    loadedAtRef.current = Date.now()
  }, [])

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    const name = ((data.get("name") ?? "") as string).trim()
    const body = ((data.get("body") ?? "") as string).trim()

    if (!name || !body || body.length > 280 || name.length > 40) return

    const tempMsg: Message = {
      id: crypto.randomUUID(),
      author_name: name,
      body,
      created_at: new Date().toISOString(),
    }

    setPendingMessages((prev) => [tempMsg, ...prev])
    setError(null)

    // Inject loadedAt before sending
    data.set("loadedAt", loadedAtRef.current.toString())

    startTransition(async () => {
      const result = await postMessage(data)
      if (result.ok) {
        setPendingMessages((prev) => prev.filter((m) => m.id !== tempMsg.id))
        if (result.message) onMessagePosted(result.message)
        form.reset()
        setBodyCount(0)
      } else {
        setPendingMessages((prev) => prev.filter((m) => m.id !== tempMsg.id))
        setError(result.error ?? "Fehler beim Senden")
      }
    })
  }

  const displayed = [...pendingMessages, ...messages]

  return (
    <section className="px-4 sm:px-6 py-8 max-w-2xl mx-auto w-full border-t border-white/[0.05]">
      <h2 className="text-[9px] tracking-[0.45em] uppercase text-white/25 font-mono mb-5">
        Anfeuern
      </h2>

      {/* Formular */}
      <form ref={formRef} onSubmit={handleSubmit} className="mb-8 flex flex-col gap-3">
        {/* Honeypot */}
        <input
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />

        <input
          name="name"
          type="text"
          placeholder="Dein Name"
          maxLength={40}
          required
          className="w-full rounded-lg px-4 py-3 text-sm bg-white/[0.04] border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-[#b8ff57]/60 focus:bg-white/[0.06] transition-colors"
        />

        <div className="relative">
          <textarea
            name="body"
            placeholder="Feuere Kilian an…"
            maxLength={280}
            required
            rows={3}
            className="w-full rounded-lg px-4 py-3 text-sm bg-white/[0.04] border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-[#b8ff57]/60 focus:bg-white/[0.06] transition-colors resize-none"
            onChange={(e) => setBodyCount(e.target.value.length)}
          />
          <span
            className="absolute bottom-2.5 right-3 text-[10px] font-mono tabular-nums pointer-events-none"
            style={{ color: bodyCount > 250 ? "#b8ff57" : "rgba(255,255,255,0.2)" }}
          >
            {bodyCount}/280
          </span>
        </div>

        {error && (
          <p className="text-sm text-red-400 px-1">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg py-3.5 text-sm font-bold tracking-widest uppercase transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "#b8ff57", color: "#0a0a0a" }}
        >
          {isPending ? "Sendet…" : "Anfeuern!"}
        </button>
      </form>

      {/* Nachrichtenliste */}
      {displayed.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {displayed.map((msg) => {
            const isPending = pendingMessages.some((p) => p.id === msg.id)
            return (
              <div
                key={msg.id}
                className={`rounded-lg px-4 py-3 animate-fade-slide-up`}
                style={{
                  backgroundColor: isPending
                    ? "rgba(184,255,87,0.04)"
                    : "rgba(255,255,255,0.03)",
                  border: isPending
                    ? "1px solid rgba(184,255,87,0.15)"
                    : "1px solid rgba(255,255,255,0.06)",
                  opacity: isPending ? 0.7 : 1,
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
            )
          })}
        </div>
      )}
    </section>
  )
}
