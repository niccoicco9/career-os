// In-memory sliding window. Adequate for a single-instance demo deploy.
// For horizontal scaling, swap the map for Redis / Upstash.
const buckets = new Map<string, number[]>()

// How large the map can grow before we opportunistically prune empty entries.
const PRUNE_THRESHOLD = 500

function pruneStale(now: number, maxWindowMs: number) {
  for (const [key, timestamps] of buckets) {
    const fresh = timestamps.filter((t) => now - t < maxWindowMs)
    if (fresh.length === 0) buckets.delete(key)
    else if (fresh.length !== timestamps.length) buckets.set(key, fresh)
  }
}

export function checkRateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now()
  const timestamps = buckets.get(key) ?? []
  const recent = timestamps.filter((t) => now - t < windowMs)
  if (recent.length >= limit) {
    const retryIn = Math.ceil((windowMs - (now - recent[0])) / 1000)
    throw new Error(`Troppe richieste. Riprova tra ${retryIn}s.`)
  }
  recent.push(now)
  buckets.set(key, recent)

  if (buckets.size > PRUNE_THRESHOLD) pruneStale(now, windowMs)
}
