import { LegalDoc, type LegalSection } from '@/components/legal-doc'
import { site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({ title: 'Terms of service', description: 'The terms for using the Fitin website and platform.', path: '/terms' })

const SECTIONS: LegalSection[] = [
  { id: 'about', title: 'About Fitin', body: <p>Fitin is a platform that connects homeowners with independent interior designers, furniture makers and material vendors in Pakistan. Designers and vendors are independent businesses; Fitin verifies them and coordinates projects but does not employ them.</p> },
  { id: 'use', title: 'Using the platform', body: <p>You agree to give accurate information, use the site lawfully, and not misuse our forms or try to disrupt the service.</p> },
  { id: 'quotes', title: 'Quotes and estimates', body: <p>Prices shown on the site, including the kitchen cost calculator, are estimates for guidance only. Your final price is set in a written quote after a site visit and depends on your space, materials and choices.</p> },
  { id: 'payments', title: 'Payments', body: <p>Payment amounts, schedules and refund terms are agreed in writing for each project before work begins.</p> },
  { id: 'partners', title: 'Designers and vendors', body: <p>Designers and vendors are responsible for the quality and timing of their own work as agreed in each project. Fitin will help resolve issues between you and a partner.</p> },
  { id: 'liability', title: 'Liability', body: <p>To the extent permitted by law, Fitin is not liable for indirect or consequential losses arising from use of the website. Nothing in these terms limits rights you have under applicable consumer law.</p> },
  { id: 'changes', title: 'Changes and contact', body: <p>We may update these terms; the date above shows the latest version. Questions? Email <a href={`mailto:${site.email}`}>{site.email}</a>.</p> },
]

export default function TermsPage() {
  return <LegalDoc title="Terms of service" active="terms" sections={SECTIONS} />
}
