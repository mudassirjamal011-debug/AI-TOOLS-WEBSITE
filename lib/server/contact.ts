/**
 * Server-only contact form delivery.
 *
 * Two real providers are supported:
 *   1. Resend  — set RESEND_API_KEY + CONTACT_TO_EMAIL (+ optional CONTACT_FROM_EMAIL)
 *   2. Generic webhook — set CONTACT_WEBHOOK_URL (Slack, Zapier, Make, n8n…)
 *
 * If neither is configured the API responds with HTTP 503 and the UI shows
 * "Contact service is not configured." — we never pretend a message was sent.
 */

export interface ContactConfig {
  configured: boolean;
  provider: 'resend' | 'webhook' | 'none';
  missing: string[];
}

export function getContactConfig(): ContactConfig {
  const resendKey = process.env.RESEND_API_KEY?.trim() ?? '';
  const toEmail = process.env.CONTACT_TO_EMAIL?.trim() ?? '';
  const webhook = process.env.CONTACT_WEBHOOK_URL?.trim() ?? '';

  if (resendKey && toEmail) return { configured: true, provider: 'resend', missing: [] };
  if (webhook) return { configured: true, provider: 'webhook', missing: [] };

  const missing: string[] = [];
  if (!resendKey) missing.push('RESEND_API_KEY');
  if (!toEmail) missing.push('CONTACT_TO_EMAIL');
  if (!webhook) missing.push('CONTACT_WEBHOOK_URL');

  return { configured: false, provider: 'none', missing };
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export class ContactNotConfiguredError extends Error {
  constructor() {
    super('Contact service is not configured.');
    this.name = 'ContactNotConfiguredError';
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function deliverContactMessage(payload: ContactPayload): Promise<void> {
  const config = getContactConfig();
  if (!config.configured) throw new ContactNotConfiguredError();

  if (config.provider === 'resend') {
    const from = process.env.CONTACT_FROM_EMAIL?.trim() || 'ToolNova AI <onboarding@resend.dev>';
    const to = (process.env.CONTACT_TO_EMAIL as string).trim();

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY as string}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: payload.email,
        subject: `[ToolNova AI] ${payload.subject}`,
        html: `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6">
            <h2 style="margin:0 0 12px">New contact form submission</h2>
            <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
            <p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>
            <p><strong>Message:</strong></p>
            <div style="white-space:pre-wrap;border-left:3px solid #8b5cf6;padding-left:12px">${escapeHtml(
              payload.message
            )}</div>
          </div>
        `,
        text: `New contact form submission\n\nName: ${payload.name}\nEmail: ${payload.email}\nSubject: ${payload.subject}\n\n${payload.message}`,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Email provider error (${response.status}): ${body.slice(0, 200) || 'unknown'}`);
    }
    return;
  }

  const response = await fetch(process.env.CONTACT_WEBHOOK_URL as string, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, source: 'toolnova-ai/contact-form' }),
  });

  if (!response.ok) {
    throw new Error(`Webhook error (${response.status})`);
  }
}

/* ------------------------------------------------------------ rate limit -- */

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function rateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Keeps the in-memory map from growing without bound. */
export function pruneRateLimits(): void {
  const now = Date.now();
  for (const [key, value] of attempts) {
    if (now > value.resetAt) attempts.delete(key);
  }
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  return ip;
}
