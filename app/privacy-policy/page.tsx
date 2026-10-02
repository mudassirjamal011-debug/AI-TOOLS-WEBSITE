import type { Metadata } from 'next';
import { LegalPage } from '@/components/content/LegalPage';
import { buildMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description:
    'How ToolNova AI handles your data: most tools process files locally in your browser, AI requests are proxied server-side, and we do not sell your files.',
  path: '/privacy-policy',
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      crumb="Privacy Policy"
      path="/privacy-policy"
      updated="2026-02-01"
      description={`This policy explains what ${siteConfig.name} does with your files and data. The short version: our browser-based tools never send your files anywhere, and we do not sell anything.`}
      sections={[
        {
          heading: 'The short version',
          paragraphs: [
            `${siteConfig.privacyNote} For image, PDF, text, file and developer tools, the processing happens on your device using the canvas API, pdf-lib, pdf.js, JSZip and the Web Crypto API. We never receive your files.`,
            'The only tools that transmit anything are the AI tools. Those send your prompt from your browser to our server, which forwards it to the configured AI provider and returns the answer. Your text is not stored by us.',
          ],
        },
        {
          heading: 'Information we collect',
          list: [
            'Files and text you process with browser-based tools: not collected, because they never leave your device.',
            'Prompts sent to AI tools: processed to produce a response and not retained by us beyond transient server logs needed to keep the service running.',
            'Contact form submissions: your name, email address, subject and message are delivered to our inbox so we can reply. They are not added to any mailing list.',
            'Aggregate usage statistics such as page views and error counts, used to understand which tools are worth improving.',
          ],
        },
        {
          heading: 'Cookies and local storage',
          paragraphs: [
            'We use local storage to remember your dark or light mode preference. That value stays on your device and is never sent to us.',
            'Advertising partners may set cookies to serve and measure ads. You can block or delete cookies in your browser settings; the tools themselves will continue to work.',
          ],
        },
        {
          heading: 'Third-party services',
          list: [
            'AI providers: whichever provider the site administrator configures through the AI_API_KEY environment variable. Requests are made from our server, never directly from your browser.',
            'Advertising networks: if ads are enabled on this deployment, the network may collect data subject to its own privacy policy.',
            'Hosting provider: receives standard request information such as IP address, user agent and the page requested.',
          ],
        },
        {
          heading: 'Data retention',
          paragraphs: [
            'Because browser-based tools do not transmit your files, there is nothing for us to retain or delete. Contact messages are kept in our inbox only as long as needed to answer them.',
          ],
        },
        {
          heading: 'Children',
          paragraphs: [
            'The tools are general-purpose utilities and are not directed at children under 13. We do not knowingly collect personal information from children.',
          ],
        },
        {
          heading: 'Your rights',
          paragraphs: [
            'Depending on where you live, you may have the right to access, correct or delete personal information we hold about you — in practice, that is limited to contact form messages. Write to us through the contact page and we will deal with the request.',
          ],
        },
        {
          heading: 'Changes to this policy',
          paragraphs: [
            'If this policy changes materially, we will update the date at the top of this page. Continuing to use the site after a change means you accept the updated policy.',
          ],
        },
      ]}
    />
  );
}
