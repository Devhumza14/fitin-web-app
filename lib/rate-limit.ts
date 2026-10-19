// ponytail: in-memory and per-process, so it resets on restart and isn't shared between instances.
// Fine for one Hostinger Node process; move to a Supabase table or Redis if the site is scaled out.
const MAX_KEYS = 10_000
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>()
  return (key: string, now = Date.now()): boolean => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
    const allowed = recent.length < limit
    if (allowed) recent.push(now)
    hits.set(key, recent)
    if (hits.size > MAX_KEYS) {
      for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k)
      // ponytail: live keys are evicted oldest-first; a flood of unique keys can flush real ones, but memory and scan cost stay flat.
      for (const k of hits.keys()) { if (hits.size <= MAX_KEYS) break; hits.delete(k) }
    }
    return allowed
  }
}
