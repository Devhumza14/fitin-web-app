'use client'
import { useSyncExternalStore } from 'react'
import { HeartIcon } from './icons'

const KEY = 'fitin:saved'
const EVENT = 'fitin:saved'

function read(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[] } catch { return [] }
}
function subscribe(cb: () => void) {
  window.addEventListener('storage', cb)
  window.addEventListener(EVENT, cb)
  return () => { window.removeEventListener('storage', cb); window.removeEventListener(EVENT, cb) }
}

export function SaveHeart({ id, title, variant = 'overlay' }: { id: string; title: string; variant?: 'overlay' | 'inline' }) {
  const saved = useSyncExternalStore(subscribe, () => read().includes(id), () => false)
  const toggle = () => {
    const list = read()
    const next = saved ? list.filter((x) => x !== id) : [...list, id]
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* private mode: heart still toggles for this view */ }
    window.dispatchEvent(new Event(EVENT))
  }
  const label = saved ? `Remove ${title} from saved` : `Save ${title}`
  if (variant === 'inline') {
    return (
      <button type="button" onClick={toggle} aria-pressed={saved} aria-label={label}
        className="flex h-10 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold text-navy underline underline-offset-4">
        <HeartIcon filled={saved} className="size-4 [&_path]:stroke-navy" />{saved ? 'Saved' : 'Save'}
      </button>
    )
  }
  return (
    <button type="button" onClick={toggle} aria-pressed={saved} aria-label={label}
      className="absolute right-2 top-2 flex size-11 items-center justify-center">
      <HeartIcon filled={saved} className="size-[26px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]" />
    </button>
  )
}
