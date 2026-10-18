import type { Ref } from 'react'

// Hidden from people and assistive tech; bots fill it. Name avoids browser autofill keys.
export const Honeypot = ({ ref }: { ref: Ref<HTMLInputElement> }) => (
  <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
    <label>Leave this empty<input ref={ref} type="text" name="company_website_hp" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
  </div>
)
