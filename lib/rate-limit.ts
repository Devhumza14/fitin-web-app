// ponytail: in-memory and per-process, so it resets on restart and isn't shared between instances.
// Fine for one Hostinger Node process; move to a Supabase table or Redis if the site is scaled out.
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>()
  return (key: string, now = Date.now()): boolean => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
    const allowed = recent.length < limit
    if (allowed) recent.push(now)
    hits.set(key, recent)
    if (hits.size > 10_000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k)
    return allowed
  }
}
