import type { Metadata } from 'next';
import { LegalPage } from '@/components/content/LegalPage';
import { buildMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Cookie Policy',
  description:
    'What cookies and local storage ToolNova AI uses: theme preference in local storage, optional advertising cookies, and no third-party tracking on tool pages.',
  path: '/cookie-policy',
});

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      crumb="Cookie Policy"
      path="/cookie-policy"
      updated="2026-02-01"
      description="We use very few cookies. This page lists every one of them and explains how to control them."
      sections={[
        {
          heading: 'What we store on your device',
          list: [
            'toolnova-theme (local storage): remembers whether you chose dark or light mode. It never leaves your device and is not sent to us.',
            'No session cookie is required to use any tool — there is no login and no session to maintain.',
          ],
        },
        {
          heading: 'Advertising cookies',
          paragraphs: [
            'If advertising is enabled on this deployment, our advertising partner may set cookies to serve ads, limit how often you see the same one, and measure performance. Those cookies are controlled by the advertising network under its own policy.',
            'You can block them in your browser settings or with an extension. Blocking them does not affect any tool on this site.',
          ],
        },
        {
          heading: 'Analytics',
          paragraphs: [
            'We rely on aggregate, privacy-respecting statistics rather than individual cross-site tracking. No analytics cookie is required to use the site.',
          ],
        },
        {
          heading: 'How to control cookies',
          list: [
            'Every major browser lets you block or delete cookies under Settings → Privacy.',
            'You can clear local storage from the same panel, which resets your theme preference to follow your system setting.',
            'Blocking all cookies may affect unrelated websites, but the tools here continue to work.',
          ],
        },
        {
          heading: 'Questions',
          paragraphs: [
            'If you want detail about anything on this page, read the privacy policy or send us a message through the contact page — we are happy to explain exactly what is stored and why.',
          ],
        },
      ]}
    />
  );
}
