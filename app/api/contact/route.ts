import { NextResponse } from 'next/server';
import {
  ContactNotConfiguredError,
  clientKey,
  deliverContactMessage,
  getContactConfig,
  pruneRateLimits,
  rateLimit,
} from '@/lib/server/contact';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface ContactBody {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  /** Honeypot field — bots fill it, humans never see it. */
  website?: string;
}

export async function POST(request: Request) {
  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid request body.', code: 'INVALID_BODY' },
      { status: 400 }
    );
  }

  // Honeypot: silently accept but do nothing.
  if (body.website) {
    return NextResponse.json({ ok: true, delivered: true, ignored: true });
  }

  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim();
  const subject = (body.subject ?? '').trim();
  const message = (body.message ?? '').trim();

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = 'Please enter your name (at least 2 characters).';
  if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';
  if (subject.length < 3) errors.subject = 'Please enter a subject (at least 3 characters).';
  if (message.length < 10) errors.message = 'Please write at least 10 characters.';
  if (message.length > 5000) errors.message = 'Please keep your message under 5,000 characters.';

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { ok: false, error: 'Please fix the highlighted fields.', errors, code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }

  pruneRateLimits();
  const limit = rateLimit(`contact:${clientKey(request)}`);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: `Too many messages sent. Please try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.`,
        code: 'RATE_LIMITED',
      },
      { status: 429 }
    );
  }

  try {
    await deliverContactMessage({ name, email, subject, message });
    return NextResponse.json({ ok: true, delivered: true, provider: getContactConfig().provider });
  } catch (error) {
    if (error instanceof ContactNotConfiguredError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Contact service is not configured. Set RESEND_API_KEY and CONTACT_TO_EMAIL (or CONTACT_WEBHOOK_URL) on the server.',
          code: 'CONTACT_NOT_CONFIGURED',
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: 'Something went wrong while sending your message. Please try again later.',
        code: 'DELIVERY_FAILED',
      },
      { status: 502 }
    );
  }
}

/** Configuration probe used by the contact page to show an honest status. */
export async function GET() {
  const config = getContactConfig();
  return NextResponse.json({ ok: true, configured: config.configured, provider: config.provider });
}
