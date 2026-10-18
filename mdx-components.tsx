// mdx-components.tsx (repo root)
import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import { AdSlot } from '@/components/ad-slot'

const components: MDXComponents = {
  h2: (p) => <h2 className="mb-3 mt-10 text-[26px] font-bold leading-tight tracking-[-0.5px] text-navy" {...p} />,
  h3: (p) => <h3 className="mb-2 mt-7 text-xl font-bold text-navy" {...p} />,
  p: (p) => <p className="mb-4 text-[17px] leading-[1.75] text-[#3B4552]" {...p} />,
  ul: (p) => <ul className="mb-5 list-disc space-y-2 pl-6 text-[17px] leading-[1.7] text-[#3B4552]" {...p} />,
  ol: (p) => <ol className="mb-5 list-decimal space-y-2 pl-6 text-[17px] leading-[1.7] text-[#3B4552]" {...p} />,
  strong: (p) => <strong className="font-bold text-ink" {...p} />,
  blockquote: (p) => <blockquote className="my-6 rounded-r-card border-l-4 border-teal bg-teal-soft px-5 py-4 text-ink" {...p} />,
  table: (p) => <div className="my-6 overflow-x-auto"><table className="w-full border-collapse text-left text-[15px]" {...p} /></div>,
  th: (p) => <th className="border-b-2 border-navy px-3 py-2 font-bold text-navy" {...p} />,
  td: (p) => <td className="border-b border-hairline px-3 py-2" {...p} />,
  a: ({ href = '', ...p }) => (href.startsWith('/') ? <Link href={href} className="underline underline-offset-4" {...p} /> : <a href={href} rel="noopener" className="underline underline-offset-4" {...p} />),
  AdBreak: () => <AdSlot />,
}

export function useMDXComponents(): MDXComponents {
  return components
}
