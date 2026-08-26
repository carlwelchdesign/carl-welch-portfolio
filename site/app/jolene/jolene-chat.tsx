'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { PublicJoleneAdapterError } from './public-adapter';
import {
  createFixturePublicJoleneAdapter,
  PUBLIC_JOLENE_FIXTURE_CORPUS_VERSION,
  publicJoleneFixtureScenarios,
  type PublicJoleneFixtureScenario,
} from './public-fixtures';
import { JoleneEvidence, type JoleneAnswerEvidence } from './jolene-evidence';
import { PublicJoleneContractError } from './public-validation';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'visitor';
  text: string;
  note?: string;
  evidence?: JoleneAnswerEvidence;
};

const conversationStarters = [
  'Which project best shows Carl’s product engineering work?',
  'How does Carl handle risk in AI-assisted systems?',
  'What should I ask Carl about in an interview?',
];

const initialMessage: ChatMessage = {
  id: 'fixture-welcome',
  role: 'assistant',
  text: 'Hi. I’m Jolene. This development preview shows how I can answer questions about Carl from reviewed public evidence.',
  note: 'Fixture mode only. No live agent is connected, and this preview does not retain a transcript.',
};

function normalizeScenario(value: string): PublicJoleneFixtureScenario {
  return publicJoleneFixtureScenarios.includes(value as PublicJoleneFixtureScenario)
    ? (value as PublicJoleneFixtureScenario)
    : 'success';
}

function describeError(error: unknown): string {
  if (error instanceof PublicJoleneAdapterError) {
    if (error.code === 'rate_limited') return 'This preview has reached its request limit. Please try again shortly.';
    if (error.code === 'version_mismatch') return 'This preview needs a contract update before it can answer safely.';
    return 'Jolene is unavailable in this preview right now.';
  }
  if (error instanceof PublicJoleneContractError) return 'That request could not be checked safely. Please revise it and try again.';
  return 'The preview could not complete that request.';
}

function getSuggestedQuestions(messages: ChatMessage[]): string[] {
  if (messages.length === 1) return conversationStarters;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const questions = messages[index].evidence?.suggestedFollowUpQuestions;
    if (questions) return questions;
  }

  return [];
}

export function JoleneFixtureChat({ scenario: scenarioValue }: { scenario: string }) {
  const scenario = normalizeScenario(scenarioValue);
  const adapter = useMemo(() => createFixturePublicJoleneAdapter(scenario), [scenario]);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageSequence = useRef(0);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const suggestedQuestions = getSuggestedQuestions(messages);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, open, waiting]);

  function closePanel() {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }

  async function sendQuestion(question: string) {
    const normalizedQuestion = question.trim();
    if (!normalizedQuestion || waiting) return;

    messageSequence.current += 1;
    const sequence = messageSequence.current;
    setMessages((current) => [
      ...current,
      { id: `visitor-${sequence}`, role: 'visitor', text: normalizedQuestion },
    ]);
    setDraft('');
    setWaiting(true);

    try {
      const response = await adapter.answer({ question: normalizedQuestion });
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${sequence}`,
          role: 'assistant',
          text: response.answer,
          note: response.limitations[0],
          evidence: {
            claims: response.claims,
            citations: response.citations,
            limitations: response.limitations,
            suggestedFollowUpQuestions: response.suggestedFollowUpQuestions,
            corpusVersion: response.corpusVersion,
            expectedCorpusVersion: PUBLIC_JOLENE_FIXTURE_CORPUS_VERSION,
            revokedEvidenceIds: [],
          },
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${sequence}`,
          role: 'assistant',
          text: describeError(error),
          note: 'No unsupported answer was generated.',
        },
      ]);
    } finally {
      setWaiting(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendQuestion(draft);
  }

  return (
    <div className="jolene-fixture" data-jolene-fixture>
      {open ? (
        <section
          className="jolene-panel"
          id="jolene-fixture-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="jolene-panel-title"
          aria-describedby="jolene-panel-description"
        >
          <header className="jolene-panel-header">
            <div>
              <p>Portfolio guide / Development fixture</p>
              <h2 id="jolene-panel-title">Ask Jolene</h2>
            </div>
            <button ref={closeRef} type="button" onClick={closePanel} aria-label="Close Jolene chat">
              Close
            </button>
          </header>

          <p className="jolene-fixture-notice" id="jolene-panel-description">
            Fixture responses only. No live agent, private memory, Obsidian access, or transcript retention.
          </p>

          <div className="jolene-messages" role="log" aria-live="polite" aria-busy={waiting}>
            {messages.map((message) => (
              <article className="jolene-message" data-role={message.role} key={message.id}>
                <p className="jolene-message-role">{message.role === 'assistant' ? 'Jolene' : 'You'}</p>
                <p>{message.text}</p>
                {message.note ? <p className="jolene-message-note">{message.note}</p> : null}
                {message.evidence ? (
                  <JoleneEvidence evidence={message.evidence} />
                ) : null}
              </article>
            ))}
            {waiting ? (
              <p className="jolene-waiting" role="status">
                Checking the public fixture evidence…
              </p>
            ) : null}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          {suggestedQuestions.length > 0 ? (
            <div className="jolene-starters" aria-label="Suggested questions">
              {messages.length > 1 ? <p>Ask next</p> : null}
              {suggestedQuestions.map((question) => (
                <button type="button" disabled={waiting} key={question} onClick={() => void sendQuestion(question)}>
                  {question}
                </button>
              ))}
            </div>
          ) : null}

          <form className="jolene-form" onSubmit={submit}>
            <label htmlFor="jolene-question">Ask about Carl’s work or experience</label>
            <textarea
              id="jolene-question"
              name="question"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={800}
              rows={3}
              placeholder="What would you like to know?"
              disabled={waiting}
            />
            <div>
              <span>{draft.length}/800</span>
              <button type="submit" disabled={waiting || !draft.trim()}>
                {waiting ? 'Checking…' : 'Ask Jolene'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <button
        ref={launcherRef}
        className="jolene-launcher"
        type="button"
        aria-expanded={open}
        aria-controls="jolene-fixture-panel"
        onClick={() => (open ? closePanel() : setOpen(true))}
        data-jolene-fixture-launcher
      >
        <span className="jolene-launcher-mark" aria-hidden="true">J</span>
        <span>
          <small>Fixture preview</small>
          Ask Jolene
        </span>
      </button>
    </div>
  );
}
