"use client"

import { useEffect, useState } from "react"
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

export function LiveDashboard({ initial }: { initial: InitialData }) {
  const [runnerState, setRunnerState] = useState(initial.runnerState)
  const [laps, setLaps] = useState(initial.laps)
  const [messages, setMessages] = useState(initial.messages)
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "error"
  >("connecting")

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    async function handleLapInsert(lap: Tables<"laps">) {
      const { data: photos } = await supabase
        .from("photos")
        .select()
        .eq("lap_id", lap.id)
      if (mounted) setLaps((prev) => [{ ...lap, photos: photos ?? [] }, ...prev])
    }

    const channel = supabase
      .channel("public-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "laps" },
        (payload) => {
          handleLapInsert(payload.new as Tables<"laps">)
        }
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
        (payload) => {
          setRunnerState(payload.new as Tables<"runner_state">)
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [payload.new as Tables<"messages">, ...prev])
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected")
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          setConnectionStatus("error")
        }
      })

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  // First lap in desc order = the most recent one; its started_at drives the countdown
  const lastStartedAt = laps[0]?.started_at ?? null

  return (
    <div className="min-h-screen">
      <Hero
        runnerState={runnerState}
        lastStartedAt={lastStartedAt}
        connectionStatus={connectionStatus}
      />
      <main className="pb-24">
        <ActivityFeed laps={laps} />
        <MessageWall messages={messages} />
      </main>
    </div>
  )
}
