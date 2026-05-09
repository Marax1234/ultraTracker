const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""

export function getThumbUrl(storagePath: string, width = 200, quality = 70): string {
  return `${SUPABASE_URL}/storage/v1/render/image/public/lap-photos/${storagePath}?width=${width}&quality=${quality}`
}

export function getFullUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/render/image/public/lap-photos/${storagePath}?width=1200&quality=85`
}
