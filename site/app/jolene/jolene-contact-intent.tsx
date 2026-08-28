'use client';

import { useState, type FormEvent } from 'react';
import type { PublicJoleneAdapter } from './public-adapter';
import { PUBLIC_JOLENE_LIMITS, type ContactIntentRequest } from './public-contract';
import { PublicJoleneContractError, parseContactIntentRequest } from './public-validation';
import { trackAnalytics } from '../analytics/analytics-client';

type ContactDraft = Omit<ContactIntentRequest, 'consent'>;
type ContactStep = 'edit' | 'review' | 'submitting' | 'submitted';

const emptyDraft: ContactDraft = {
  name: '',
  email: '',
  organization: '',
  message: '',
};

function validateDraft(draft: ContactDraft): ContactDraft {
  const validated = parseContactIntentRequest({
    ...draft,
    organization: draft.organization?.trim() || undefined,
    consent: true,
  });
  return {
    name: validated.name,
    email: validated.email,
    organization: validated.organization,
    message: validated.message,
  };
}

export function JoleneContactIntent({
  adapter,
  onReturnToChat,
}: {
  adapter: Pick<PublicJoleneAdapter, 'submitContactIntent'>;
  onReturnToChat: () => void;
}) {
  const [step, setStep] = useState<ContactStep>('edit');
  const [draft, setDraft] = useState<ContactDraft>(emptyDraft);
  const [reviewedDraft, setReviewedDraft] = useState<ContactDraft | null>(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ intentId: string; message: string } | null>(null);

  function update(field: keyof ContactDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setError(null);
  }

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setReviewedDraft(validateDraft(draft));
      setConsent(false);
      setError(null);
      setStep('review');
    } catch (validationError) {
      setError(
        validationError instanceof PublicJoleneContractError
          ? 'Please check the name, email, and message fields and try again.'
          : 'This request could not be reviewed safely.',
      );
    }
  }

  async function submit() {
    if (!reviewedDraft || !consent || step === 'submitting') return;
    setError(null);
    setStep('submitting');

    try {
      const response = await adapter.submitContactIntent({ ...reviewedDraft, consent: true });
      trackAnalytics('jolene_response', { operation: 'contact_intent', state: 'success' });
      setReceipt({ intentId: response.intentId, message: response.message });
      setDraft(emptyDraft);
      setReviewedDraft(null);
      setConsent(false);
      setStep('submitted');
    } catch {
      trackAnalytics('jolene_response', { operation: 'contact_intent', state: 'error' });
      setError('The contact request was not submitted. No outbound action was taken.');
      setStep('review');
    }
  }

  if (step === 'submitted' && receipt) {
    return (
      <section className="jolene-contact jolene-contact-receipt" aria-labelledby="jolene-contact-receipt-title">
        <p className="jolene-contact-kicker">Sent to Carl</p>
        <h3 id="jolene-contact-receipt-title">Request received</h3>
        <p>{receipt.message}</p>
        <p className="jolene-contact-receipt-id">Reference · {receipt.intentId}</p>
        <p className="jolene-contact-policy">
          Carl reviews requests himself. Jolene cannot make commitments on his behalf.
        </p>
        <button type="button" onClick={onReturnToChat}>Return to questions</button>
      </section>
    );
  }

  if ((step === 'review' || step === 'submitting') && reviewedDraft) {
    return (
      <section className="jolene-contact" aria-labelledby="jolene-contact-review-title">
        <p className="jolene-contact-kicker">Review before submitting</p>
        <h3 id="jolene-contact-review-title">Exactly what Carl will receive</h3>
        <dl className="jolene-contact-summary">
          <div><dt>Name</dt><dd>{reviewedDraft.name}</dd></div>
          <div><dt>Email</dt><dd>{reviewedDraft.email}</dd></div>
          {reviewedDraft.organization ? <div><dt>Organization</dt><dd>{reviewedDraft.organization}</dd></div> : null}
          <div><dt>Message</dt><dd>{reviewedDraft.message}</dd></div>
        </dl>
        <label className="jolene-contact-consent">
          <input
            type="checkbox"
            checked={consent}
            disabled={step === 'submitting'}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>I consent to send these fields to Carl for review.</span>
        </label>
        <p className="jolene-contact-policy">
          Nothing is sent until you confirm. Carl reviews each request himself.
        </p>
        {error ? <p className="jolene-contact-error" role="alert">{error}</p> : null}
        <div className="jolene-contact-actions">
          <button type="button" disabled={step === 'submitting'} onClick={() => setStep('edit')}>Edit</button>
          <button type="button" disabled={!consent || step === 'submitting'} onClick={() => void submit()}>
            {step === 'submitting' ? 'Submitting…' : 'Submit for review'}
          </button>
        </div>
      </section>
    );
  }

  return (
    <form className="jolene-contact" onSubmit={review} aria-labelledby="jolene-contact-title">
      <p className="jolene-contact-kicker">Contact Carl</p>
      <h3 id="jolene-contact-title">Ask Carl to follow up</h3>
      <p className="jolene-contact-policy">
        Fill this out, review every field, and confirm when you are ready to send it to Carl.
      </p>
      <label>
        Name
        <input
          name="name"
          autoComplete="name"
          required
          maxLength={PUBLIC_JOLENE_LIMITS.contactNameCharacters}
          value={draft.name}
          onChange={(event) => update('name', event.target.value)}
        />
      </label>
      <label>
        Email
        <input
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={PUBLIC_JOLENE_LIMITS.contactEmailCharacters}
          value={draft.email}
          onChange={(event) => update('email', event.target.value)}
        />
      </label>
      <label>
        Organization <span>Optional</span>
        <input
          name="organization"
          autoComplete="organization"
          maxLength={PUBLIC_JOLENE_LIMITS.contactOrganizationCharacters}
          value={draft.organization ?? ''}
          onChange={(event) => update('organization', event.target.value)}
        />
      </label>
      <label>
        Message
        <textarea
          name="message"
          required
          rows={4}
          maxLength={PUBLIC_JOLENE_LIMITS.contactMessageCharacters}
          value={draft.message}
          onChange={(event) => update('message', event.target.value)}
        />
        <small>{draft.message.length}/{PUBLIC_JOLENE_LIMITS.contactMessageCharacters}</small>
      </label>
      {error ? <p className="jolene-contact-error" role="alert">{error}</p> : null}
      <button type="submit">Review request</button>
    </form>
  );
}
