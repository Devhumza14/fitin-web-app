type P = { className?: string }
const line = { 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const DesignIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 32 32" strokeWidth={1.8} className={className}>
    <rect x="5" y="5" width="22" height="22" rx="3" /><path d="M5 14h9v13" /><path d="M19 5v6h8" />
    <circle cx="21" cy="20" r="2.5" fill="#B6D22A" stroke="none" />
  </svg>
)
export const BuildIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 32 32" strokeWidth={1.8} className={className}>
    <path d="M4 27h24" /><rect x="7" y="18" width="8" height="9" rx="1" /><rect x="17" y="18" width="8" height="9" rx="1" />
    <rect x="12" y="9" width="8" height="9" rx="1" fill="#229E9F" stroke="#229E9F" />
  </svg>
)
export const JournalIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 32 32" strokeWidth={1.8} className={className}>
    <path d="M6 6h9a3 3 0 0 1 3 3v17a2 2 0 0 0-2-2H6z" /><path d="M26 6h-5a3 3 0 0 0-3 3v17a2 2 0 0 1 2-2h6z" />
    <path d="M9 11h5M9 15h5" stroke="#B6D22A" />
  </svg>
)
export const ArrowRightIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2.4} className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)
export const CheckIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2.4} className={className}><path d="M5 12l5 5L20 7" /></svg>
)
export const AlertIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2.2} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5h.01" /></svg>
)
export const WhatsAppIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2} className={className}><path d="M21 12a9 9 0 0 1-13.2 8L3 21l1.1-4.6A9 9 0 1 1 21 12z" /></svg>
)
export const HeartIcon = ({ className, filled }: P & { filled?: boolean }) => (
  <svg aria-hidden viewBox="0 0 24 24" className={className} fill={filled ? '#229E9F' : 'rgba(14,35,64,0.45)'} stroke="#fff" strokeWidth={2} strokeLinejoin="round">
    <path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.7 3.9 4.5 7.3 4.5c2 0 3.6 1.1 4.7 2.7 1.1-1.6 2.7-2.7 4.7-2.7 3.4 0 5.7 3.2 4.5 6.7-1.7 4.7-9.2 9.3-9.2 9.3z" />
  </svg>
)
export const MenuIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2} className={className}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
)
export const CloseIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2.2} className={className}><path d="M6 6l12 12M18 6L6 18" /></svg>
)
export const SearchIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2.4} className={className}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
)
export const PhoneIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2} className={className}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>
)
export const MailIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2} className={className}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
)
export const ChevronRightIcon = ({ className }: P) => (
  <svg {...line} viewBox="0 0 24 24" strokeWidth={2} className={className}><path d="M9 6l6 6-6 6" /></svg>
)
export const PlayIcon = ({ className }: P) => (
  <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M8 5v14l11-7z" /></svg>
)
