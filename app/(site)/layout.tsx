import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { JsonLd } from '@/components/json-ld'
import { organizationLd } from '@/lib/jsonld'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-btn focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <JsonLd data={organizationLd()} />
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  )
}
