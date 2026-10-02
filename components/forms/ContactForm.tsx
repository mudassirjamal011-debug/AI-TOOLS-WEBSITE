'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, TextArea, TextInput } from '@/components/ui/Inputs';
import { StatusMessage } from '@/components/ui/Feedback';
import { useToast } from '@/components/ui/Toast';

interface FieldErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ContactForm() {
  const { toast } = useToast();
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const [serviceConfigured, setServiceConfigured] = useState<boolean | null>(null);

  // Ask the server whether delivery is configured, so the form is honest up front.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/contact')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data) setServiceConfigured(Boolean(data.configured));
      })
      .catch(() => {
        if (!cancelled) setServiceConfigured(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (values.name.trim().length < 2) next.name = 'Please enter your name (at least 2 characters).';
    if (!EMAIL_RE.test(values.email.trim())) next.email = 'Please enter a valid email address.';
    if (values.subject.trim().length < 3) next.subject = 'Please enter a subject (at least 3 characters).';
    if (values.message.trim().length < 10) next.message = 'Please write at least 10 characters.';
    if (values.message.length > 5000) next.message = 'Please keep your message under 5,000 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(null);

    if (!validate()) {
      toast({ title: 'Please fix the highlighted fields.', variant: 'warning' });
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        errors?: FieldErrors;
        code?: string;
      };

      if (!response.ok || !data.ok) {
        if (data.errors) setErrors(data.errors);
        setServerError(data.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        toast({
          title: data.code === 'CONTACT_NOT_CONFIGURED' ? 'Contact service is not configured.' : 'Message not sent',
          description: data.error,
          variant: 'error',
        });
        return;
      }

      setStatus('sent');
      setValues({ name: '', email: '', subject: '', message: '', website: '' });
      toast({ title: 'Message sent', description: 'We will reply as soon as we can.', variant: 'success' });
    } catch {
      setServerError('Something went wrong. Please try again.');
      setStatus('error');
      toast({ title: 'Message not sent', description: 'Network error. Please try again.', variant: 'error' });
    }
  };

  if (status === 'sent') {
    return (
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-6 text-center">
        <CheckCircle2 aria-hidden className="mx-auto h-10 w-10 text-emerald-500" />
        <h2 className="mt-3 font-display text-lg font-bold">Message sent</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted">
          Thanks — your message reached us. We read everything and usually reply within a couple of
          working days.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => setStatus('idle')}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {serviceConfigured === false ? (
        <StatusMessage tone="warning" title="Contact service is not configured.">
          This deployment has no email provider configured, so messages cannot be delivered yet. Set{' '}
          <code>RESEND_API_KEY</code> and <code>CONTACT_TO_EMAIL</code> (or <code>CONTACT_WEBHOOK_URL</code>)
          in the server environment to enable delivery. Nothing you type below will be sent until then.
        </StatusMessage>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="contact-name" required error={errors.name}>
          <TextInput
            id="contact-name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
          />
        </Field>
        <Field label="Email" htmlFor="contact-email" required error={errors.email}>
          <TextInput
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
          />
        </Field>
      </div>

      <Field label="Subject" htmlFor="contact-subject" required error={errors.subject}>
        <TextInput
          id="contact-subject"
          name="subject"
          value={values.subject}
          onChange={(event) => setValues((current) => ({ ...current, subject: event.target.value }))}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
        />
      </Field>

      <Field
        label="Message"
        htmlFor="contact-message"
        required
        error={errors.message}
        hint={`${values.message.length} / 5,000 characters`}
      >
        <TextArea
          id="contact-message"
          name="message"
          value={values.message}
          onChange={(event) => setValues((current) => ({ ...current, message: event.target.value }))}
          className="min-h-[160px]"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
        />
      </Field>

      {/* Honeypot — hidden from people, tempting for bots. */}
      <div className="hidden" aria-hidden>
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => setValues((current) => ({ ...current, website: event.target.value }))}
        />
      </div>

      {serverError ? <StatusMessage tone="error">{serverError}</StatusMessage> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={status === 'sending'}>
          {status === 'sending' ? (
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          ) : (
            <Send aria-hidden className="h-4 w-4" />
          )}
          Send message
        </Button>
        <p className="text-xs text-muted">
          We use your details only to answer your message. See our{' '}
          <a href="/privacy-policy" className="font-semibold text-brand-purple hover:underline">
            privacy policy
          </a>
          .
        </p>
      </div>
    </form>
  );
}
