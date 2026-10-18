import { whatsappLink } from '@/lib/whatsapp'
import { WhatsAppIcon } from '../icons'

export function WhatsAppFallback({ summary }: { summary: string }) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-panel bg-lime-soft p-5">
      <p className="font-bold text-navy">We couldn&apos;t send that just now.</p>
      <p className="text-sm text-[#3B4552]">Your details are below — send them to us on WhatsApp and we&apos;ll reply there.</p>
      <a href={whatsappLink(summary)} className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-navy px-5 font-semibold text-white hover:text-white">
        <WhatsAppIcon className="size-[18px]" />Send it on WhatsApp
      </a>
    </div>
  )
}
