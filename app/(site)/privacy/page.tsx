import Link from 'next/link'
import { LegalDoc, type LegalSection } from '@/components/legal-doc'
import { site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({ title: 'Privacy policy', description: 'How Fitin collects, uses and protects your information, including cookies and advertising.', path: '/privacy' })

const SECTIONS: LegalSection[] = [
  { id: 'collect', title: 'What we collect', body: <p>When you use our forms we collect the details you choose to give us: your name, phone number, email address, city and information about your project or business. When you browse the site, we and our service providers collect basic technical information such as pages visited, device and browser type, and approximate location derived from your IP address.</p> },
  { id: 'use', title: 'How we use it', body: <p>We use your details to respond to your request, match you with designers and vendors, prepare quotes, keep you updated about your project (including by WhatsApp if you agree), and improve our website. We do not sell your personal information.</p> },
  { id: 'share', title: 'Who we share it with', body: <p>We share project details only with the designers and vendors working on your project, and with service providers who help us run Fitin, such as our database host (Supabase), email delivery (Resend), analytics (Google Analytics) and website hosting. They may only use your information to provide their service to us.</p> },
  { id: 'cookies', title: 'Cookies and advertising', body: (
    <>
      <p>We use cookies to understand how the site is used and to show advertising on our Journal articles. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.</p>
      <p>You can opt out of personalised advertising by visiting <a href="https://adssettings.google.com">Google Ads Settings</a>, or opt out of some third-party vendors&apos; use of cookies for personalised advertising at <a href="https://www.aboutads.info/choices/">www.aboutads.info</a>. Visitors in the European Economic Area, the UK and Switzerland are asked for consent through Google&apos;s consent message before advertising or analytics cookies are used.</p>
    </>
  ) },
  { id: 'retention', title: 'How long we keep it', body: <p>We keep enquiry and project records for as long as needed to provide our service and meet legal and accounting obligations, and then delete or anonymise them.</p> },
  { id: 'choices', title: 'Your choices', body: <p>You can ask us to show, correct or delete the personal information we hold about you, or to stop WhatsApp updates, at any time by emailing <a href={`mailto:${site.email}`}>{site.email}</a>.</p> },
  { id: 'contact', title: 'Contact', body: <p>Questions about this policy? Email <a href={`mailto:${site.email}`}>{site.email}</a> or <Link href="/contact">contact us</Link>.</p> },
]

export default function PrivacyPage() {
  return <LegalDoc title="Privacy policy" active="privacy" sections={SECTIONS} />
}
