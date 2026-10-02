import type { Metadata } from 'next';
import { Clock, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import { Breadcrumbs } from '@/components/content/Breadcrumbs';
import { Faq } from '@/components/content/Faq';
import { ContactForm } from '@/components/forms/ContactForm';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import { buildMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Contact ToolNova AI',
  description:
    'Questions, bug reports or partnership ideas? Send the ToolNova AI team a message. Real form validation, real server-side delivery, no fake “thanks” screens.',
  path: '/contact',
});

const faq = [
  {
    question: 'How quickly will I get a reply?',
    answer:
      'We aim to answer within two working days. Bug reports that break a tool are prioritised over feature requests.',
  },
  {
    question: 'Can you add a tool I need?',
    answer:
      'Tell us what you are trying to do and what you have tried. Requests that many people ask for, and that can be built honestly in the browser, go to the top of the list.',
  },
  {
    question: 'Do you take bug reports seriously?',
    answer:
      'Yes. Include the browser and device you used, the file type and size, and what you expected to happen. That is usually enough for us to reproduce the problem.',
  },
  {
    question: 'Is my message stored?',
    answer:
      'Your message is delivered to our inbox so we can reply. We do not add you to a mailing list, and there is no newsletter to be added to.',
  },
];

export default function ContactPage() {
  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ name: 'Contact', href: '/contact' }]} />

      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Contact ToolNova AI
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
          Found a bug, want a new tool, or just want to say hello? Use the form below — it validates
          every field and delivers through a configured email service. If no service is configured on
          this deployment, the form tells you instead of pretending the message was sent.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-3xl border border-line/10 bg-surface/50 p-5 sm:p-7">
          <ContactForm />
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-line/10 bg-surface/60 p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
              <MessageSquare aria-hidden className="h-4 w-4 text-brand-purple" />
              Other ways to reach us
            </h2>
            <ul className="mt-3 space-y-3 text-sm text-muted">
              <li className="flex items-start gap-2.5">
                <Mail aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <a href={`mailto:${siteConfig.email}`} className="font-semibold text-fg hover:underline">
                    {siteConfig.email}
                  </a>
                  <br />
                  For anything that is not urgent.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                <span>We reply within two working days, usually much sooner for bug reports.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>
                  Never send passwords, API keys or confidential documents through this form.
                </span>
              </li>
            </ul>
          </div>

          <AdPlaceholder slot="sidebar" />
        </aside>
      </div>

      <section aria-labelledby="contact-faq" className="mt-14">
        <h2 id="contact-faq" className="font-display text-xl font-bold">
          Contact FAQ
        </h2>
        <Faq items={faq} className="mt-4 max-w-3xl" />
      </section>
    </div>
  );
}
