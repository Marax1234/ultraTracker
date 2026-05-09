import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"
import { formatDuration } from "@/lib/utils/time"
import type { Tables } from "@/lib/supabase/database.types"

export type LapWithPhotos = Tables<"laps"> & { photos: Tables<"photos">[] }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""

function photoUrl(storagePath: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/lap-photos/${storagePath}`
}

function LapCard({ lap }: { lap: LapWithPhotos }) {
  const isActive = !lap.completed_at

  return (
    <article
      className="rounded-r-lg pl-4 pr-4 py-4"
      style={{
        borderLeft: `2px solid ${isActive ? "#b8ff57" : "rgba(255,255,255,0.1)"}`,
        backgroundColor: "rgba(255,255,255,0.028)",
      }}
    >
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-white/30">Runde</span>
          <span
            className="text-xl font-bold tabular-nums"
            style={{ fontFamily: "var(--font-barlow-condensed), sans-serif" }}
          >
            {lap.lap_number}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {isActive ? (
            <span className="text-[10px] font-mono tracking-widest text-[#b8ff57]/70">
              läuft…
            </span>
          ) : (
            <>
              {lap.duration_seconds !== null && (
                <span className="text-sm font-mono text-white/50 tabular-nums">
                  {formatDuration(lap.duration_seconds)}
                </span>
              )}
              {lap.completed_at && (
                <span className="text-[10px] font-mono text-white/25">
                  {formatDistanceToNow(new Date(lap.completed_at), {
                    addSuffix: true,
                    locale: de,
                  })}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {lap.note && (
        <p className="mt-2 text-sm text-white/45 leading-relaxed">{lap.note}</p>
      )}

      {lap.photos.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -ml-1">
          {lap.photos.map((photo) => (
            <a
              key={photo.id}
              href={photoUrl(photo.storage_path)}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-md overflow-hidden border border-white/10 hover:border-white/25 transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl(photo.storage_path)}
                alt={`Foto Runde ${lap.lap_number}`}
                width={88}
                height={88}
                className="size-22 object-cover"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      )}
    </article>
  )
}

export function ActivityFeed({ laps }: { laps: LapWithPhotos[] }) {
  if (laps.length === 0) {
    return (
      <section className="px-5 py-14 flex justify-center">
        <p className="text-[11px] font-mono tracking-widest uppercase text-white/20">
          Noch keine Runden abgeschlossen
        </p>
      </section>
    )
  }

  return (
    <section className="px-4 sm:px-6 py-8 max-w-2xl mx-auto w-full">
      <h2 className="text-[9px] tracking-[0.45em] uppercase text-white/25 font-mono mb-5">
        Aktivitäten
      </h2>
      <div className="flex flex-col gap-3">
        {laps.map((lap) => (
          <LapCard key={lap.id} lap={lap} />
        ))}
      </div>
    </section>
  )
}
