"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/database.types"
import { Hero } from "./Hero"
import { ActivityFeed, type LapWithPhotos } from "./ActivityFeed"
import { MessageWall } from "./MessageWall"

type InitialData = {
  runnerState: Tables<"runner_state"> | null
  laps: LapWithPhotos[]
  messages: Tables<"messages">[]
}

type ConnectionStatus = "connecting" | "connected" | "error" | "reconnecting"

export function LiveDashboard({ initial }: { initial: InitialData }) {
  const [runnerState, setRunnerState] = useState(initial.runnerState)
  const [laps, setLaps] = useState(initial.laps)
  const [messages, setMessages] = useState(initial.messages)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting")

  const seenLapIds = useRef(new Set(initial.laps.map((l) => l.id)))
  const [newLapIds, setNewLapIds] = useState<Set<string>>(new Set())

  function addMessage(msg: Tables<"messages">) {
    setMessages((prev) =>
      prev.some((m) => m.id === msg.id) ? prev : [msg, ...prev]
    )
  }

  useEffect(() => {
    let mounted = true
    const supabase = createClient()
    let retryTimeout: ReturnType<typeof setTimeout> | null = null
    let backoffMs = 1000

    async function handleLapInsert(lap: Tables<"laps">) {
      const { data: photos } = await supabase
        .from("photos")
        .select()
        .eq("lap_id", lap.id)
      if (!mounted) return
      setLaps((prev) => [{ ...lap, photos: photos ?? [] }, ...prev])
      if (!seenLapIds.current.has(lap.id)) {
        seenLapIds.current.add(lap.id)
        setNewLapIds((prev) => new Set([...prev, lap.id]))
      }
    }

    function connect() {
      if (!mounted) return
      setConnectionStatus("connecting")

      const channel = supabase
        .channel("public-live")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "laps" },
          (payload) => { handleLapInsert(payload.new as Tables<"laps">) }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "laps" },
          (payload) => {
            const updated = payload.new as Tables<"laps">
            setLaps((prev) =>
              prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l))
            )
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "runner_state" },
          (payload) => { setRunnerState(payload.new as Tables<"runner_state">) }
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => { addMessage(payload.new as Tables<"messages">) }
        )
        .subscribe((status) => {
          if (!mounted) return
          if (status === "SUBSCRIBED") {
            setConnectionStatus("connected")
            backoffMs = 1000 // reset backoff on success
          } else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            setConnectionStatus("reconnecting")
            supabase.removeChannel(channel)
            retryTimeout = setTimeout(() => {
              backoffMs = Math.min(backoffMs * 2, 30000)
              connect()
            }, backoffMs)
          }
        })
    }

    connect()

    return () => {
      mounted = false
      if (retryTimeout) clearTimeout(retryTimeout)
      // channel cleanup is handled inside connect() on error; on unmount we rely on supabase-js GC
    }
  }, [])

  const lastStartedAt = laps[0]?.started_at ?? null

  return (
    <div className="min-h-screen">
      <Hero
        runnerState={runnerState}
        lastStartedAt={lastStartedAt}
        connectionStatus={connectionStatus}
      />
      <main className="pb-24">
        <ActivityFeed laps={laps} newLapIds={newLapIds} />
        <MessageWall messages={messages} onMessagePosted={addMessage} />
      </main>
    </div>
  )
}
