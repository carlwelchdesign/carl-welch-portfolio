'use client';

import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { PublicJoleneAdapterError } from './public-adapter';
import { createBrowserPublicJoleneAdapter } from './public-browser-adapter';
import {
  createFixturePublicJoleneAdapter,
  PUBLIC_JOLENE_FIXTURE_CORPUS_VERSION,
  publicJoleneFixtureScenarios,
  type PublicJoleneFixtureScenario,
} from './public-fixtures';
import { JoleneEvidence, type JoleneAnswerEvidence } from './jolene-evidence';
import { PublicJoleneContractError } from './public-validation';
import { JoleneContactIntent } from './jolene-contact-intent';
import { JoleneJobFit } from './jolene-job-fit';
import { trackAnalytics } from '../analytics/analytics-client';
import { JoleneAvatar, preloadJoleneAvatarAssets, useJoleneAvatarController } from './jolene-avatar';

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

type JoleneMode = 'fixture' | 'live';

function initialMessage(mode: JoleneMode): ChatMessage {
  return {
    id: `${mode}-welcome`,
    role: 'assistant',
    text: mode === 'live'
      ? 'Hi. I’m Jolene. Ask me about Carl’s work, experience, or qualifications.'
      : 'Hi. I’m Jolene. Try a question about Carl’s work, experience, or qualifications.',
    note: mode === 'live'
      ? 'I’ll point you to the work behind every answer.'
      : 'Sample answers are standing in while Jolene’s live connection is off.',
  };
}

function normalizeScenario(value: string): PublicJoleneFixtureScenario {
  return publicJoleneFixtureScenarios.includes(value as PublicJoleneFixtureScenario)
    ? (value as PublicJoleneFixtureScenario)
    : 'success';
}

function describeError(error: unknown): string {
  if (error instanceof PublicJoleneAdapterError) {
    if (error.code === 'rate_limited') return 'Jolene has reached her request limit. Please try again shortly.';
    if (error.code === 'version_mismatch') return 'Jolene is catching up with the latest portfolio update. Please try again soon.';
    return 'Jolene is unavailable right now.';
  }
  if (error instanceof PublicJoleneContractError) return 'Jolene could not read that question. Please revise it and try again.';
  return 'Jolene could not complete that request.';
}

function getSuggestedQuestions(messages: ChatMessage[]): string[] {
  if (messages.length === 1) return conversationStarters;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const questions = messages[index].evidence?.suggestedFollowUpQuestions;
    if (questions) return questions;
  }

  return [];
}

function getLatestAssistantMessageId(messages: ChatMessage[]): string | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === 'assistant') return messages[index].id;
  }

  return null;
}

export function JoleneChat({
  mode: connectionMode,
  scenario: scenarioValue = 'success',
  contactIntentEnabled = false,
}: {
  mode: JoleneMode;
  scenario?: string;
  contactIntentEnabled?: boolean;
}) {
  const scenario = normalizeScenario(scenarioValue);
  const adapter = useMemo(
    () => connectionMode === 'live' ? createBrowserPublicJoleneAdapter() : createFixturePublicJoleneAdapter(scenario),
    [connectionMode, scenario],
  );
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestAssistantRef = useRef<HTMLElement>(null);
  const focusedAssistantId = useRef<string | null>(null);
  const messageSequence = useRef(0);
  const answerAnimationTimer = useRef<number | null>(null);
  const typingAnimationTimer = useRef<number | null>(null);
  const reducedMotion = useReducedMotion() === true;
  const { state: avatarState, send: sendAvatar, settle: settleAvatar } = useJoleneAvatarController();
  const [open, setOpen] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [mode, setMode] = useState<'chat' | 'job' | 'contact'>('chat');
  const [draft, setDraft] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage(connectionMode)]);
  const suggestedQuestions = getSuggestedQuestions(messages);
  const latestAssistantMessageId = getLatestAssistantMessageId(messages);

  const closePanel = useCallback(() => {
    if (answerAnimationTimer.current !== null) window.clearTimeout(answerAnimationTimer.current);
    if (typingAnimationTimer.current !== null) window.clearTimeout(typingAnimationTimer.current);
    sendAvatar('inactive');
    setOpen(false);
    setMode('chat');
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, [sendAvatar]);

  useEffect(() => {
    if (reducedMotion) return;
    const storageKey = 'jolene-country-host-intro-seen-v1';
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, 'true');
    const showTimer = window.setTimeout(() => {
      sendAvatar('intro_started');
      setIntroVisible(true);
    }, 550);
    const hideTimer = window.setTimeout(() => setIntroVisible(false), 3_250);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [reducedMotion, sendAvatar]);

  useEffect(() => () => {
    if (answerAnimationTimer.current !== null) window.clearTimeout(answerAnimationTimer.current);
    if (typingAnimationTimer.current !== null) window.clearTimeout(typingAnimationTimer.current);
  }, []);

  useEffect(() => {
    if (open) preloadJoleneAvatarAssets();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [closePanel, open]);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, open, waiting]);

  useEffect(() => {
    if (
      !open
      || waiting
      || messages.length === 1
      || !latestAssistantMessageId
      || focusedAssistantId.current === latestAssistantMessageId
    ) return;

    latestAssistantRef.current?.focus({ preventScroll: true });
    focusedAssistantId.current = latestAssistantMessageId;
  }, [latestAssistantMessageId, messages.length, open, waiting]);

  async function sendQuestion(question: string) {
    const normalizedQuestion = question.trim();
    if (!normalizedQuestion || waiting) return;

    if (answerAnimationTimer.current !== null) window.clearTimeout(answerAnimationTimer.current);
    if (typingAnimationTimer.current !== null) window.clearTimeout(typingAnimationTimer.current);
    sendAvatar('visitor_input');
    sendAvatar('request_started');

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
      trackAnalytics('jolene_response', {
        operation: 'answer',
        state: response.claims.length > 0 ? 'success' : 'no_evidence',
      });
      sendAvatar(response.claims.length > 0 ? 'answer_started' : 'cannot_verify');
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
            expectedCorpusVersion: connectionMode === 'fixture'
              ? PUBLIC_JOLENE_FIXTURE_CORPUS_VERSION
              : response.corpusVersion,
            revokedEvidenceIds: [],
          },
        },
      ]);
      if (response.claims.length > 0) {
        answerAnimationTimer.current = window.setTimeout(() => sendAvatar('answer_finished'), 2_200);
      }
    } catch (error) {
      sendAvatar(error instanceof PublicJoleneAdapterError && error.code === 'unavailable'
        ? 'service_unavailable'
        : 'cannot_verify');
      trackAnalytics('jolene_response', {
        operation: 'answer',
        state: error instanceof PublicJoleneAdapterError && error.code === 'unavailable' ? 'unavailable' : 'error',
      });
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${sequence}`,
          role: 'assistant',
          text: describeError(error),
          note: 'I don’t have a reliable answer for that yet.',
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

  function updateDraft(value: string) {
    setDraft(value);
    if (typingAnimationTimer.current !== null) window.clearTimeout(typingAnimationTimer.current);
    if (!value.trim()) {
      sendAvatar('activity_resumed');
      return;
    }
    sendAvatar('visitor_typing');
    typingAnimationTimer.current = window.setTimeout(() => {
      sendAvatar('visitor_input');
      typingAnimationTimer.current = null;
    }, 650);
  }

  function askFromComparison(question: string) {
    setMode('chat');
    void sendQuestion(question);
  }

  return (
    <div className="jolene-fixture" data-jolene-mode={connectionMode} {...(connectionMode === 'fixture' ? { 'data-jolene-fixture': true } : {})}>
      <AnimatePresence>
        {introVisible && !open ? (
          <m.aside
            className="jolene-cameo"
            aria-label="Jolene says Howdy, folks!"
            initial={{ y: '115%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '115%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <p>Howdy, folks!</p>
            <JoleneAvatar state={avatarState} onStateComplete={settleAvatar} />
          </m.aside>
        ) : null}
      </AnimatePresence>

      {open ? (
        <section
          className="jolene-panel"
          id="jolene-fixture-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="jolene-panel-title"
          aria-describedby="jolene-panel-description"
          data-mode={mode}
        >
          <header className="jolene-panel-header">
            <div className="jolene-panel-heading">
              <p>{connectionMode === 'live' ? 'Carl’s portfolio guide' : 'Jolene preview'}</p>
              <h2 id="jolene-panel-title">
                {mode === 'contact' ? 'Contact Carl' : mode === 'job' ? 'Compare a role' : 'Ask Jolene'}
              </h2>
            </div>
            <button ref={closeRef} type="button" onClick={closePanel} aria-label="Close Jolene chat">
              Close
            </button>
          </header>

          <p className="jolene-fixture-notice" id="jolene-panel-description">
            {connectionMode === 'live'
              ? 'Ask about Carl’s work, experience, or how his background lines up with a role.'
              : 'This preview uses sample answers while the live connection is off.'}
          </p>

          <nav className="jolene-mode-switch" aria-label="Jolene panel sections">
            <button type="button" aria-pressed={mode === 'chat'} onClick={() => { setMode('chat'); sendAvatar('activity_resumed'); }}>Questions</button>
            <button type="button" aria-pressed={mode === 'job'} onClick={() => { setMode('job'); sendAvatar('visitor_input'); }}>Compare role</button>
            {contactIntentEnabled ? (
              <button type="button" aria-pressed={mode === 'contact'} onClick={() => { setMode('contact'); sendAvatar('inactive'); }}>Request contact</button>
            ) : null}
          </nav>

          {mode === 'chat' ? <><div className="jolene-messages" role="log" aria-live="polite" aria-busy={waiting}>
            {messages.map((message) => (
              <article
                className="jolene-message"
                data-role={message.role}
                key={message.id}
                ref={message.id === latestAssistantMessageId && messages.length > 1 ? latestAssistantRef : undefined}
                tabIndex={message.id === latestAssistantMessageId && messages.length > 1 ? -1 : undefined}
              >
                <p className="jolene-message-role">{message.role === 'assistant' ? 'Jolene' : 'You'}</p>
                <p>{message.text}</p>
                {message.note ? <p className="jolene-message-note">{message.note}</p> : null}
                {message.evidence ? (
                  <JoleneEvidence evidence={message.evidence} onOpen={() => sendAvatar('evidence_highlighted')} />
                ) : null}
              </article>
            ))}
            {waiting ? (
              <p className="jolene-waiting" role="status">
                Looking through Carl’s work…
              </p>
            ) : null}
            <div className="jolene-starter-stage" data-has-suggestions={suggestedQuestions.length > 0}>
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
              <JoleneAvatar
                state={avatarState}
                onStateComplete={settleAvatar}
                className="jolene-conversation-avatar"
              />
            </div>
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          <form className="jolene-form" onSubmit={submit}>
            <label htmlFor="jolene-question">Ask about Carl’s work or experience</label>
            <textarea
              id="jolene-question"
              name="question"
              value={draft}
              onChange={(event) => updateDraft(event.target.value)}
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
          </form></> : mode === 'contact' ? (
            <JoleneContactIntent adapter={adapter} onReturnToChat={() => setMode('chat')} />
          ) : (
            <JoleneJobFit adapter={adapter} mode={connectionMode} onAskQuestion={askFromComparison} />
          )}
        </section>
      ) : null}

      <button
        ref={launcherRef}
        className="jolene-launcher"
        type="button"
        aria-expanded={open}
        aria-controls="jolene-fixture-panel"
        onClick={() => {
          if (open) closePanel();
          else {
            trackAnalytics('jolene_open', { source: 'launcher' });
            setIntroVisible(false);
            sendAvatar('chat_opened');
            setOpen(true);
          }
        }}
        data-jolene-launcher
        hidden={open}
        {...(connectionMode === 'fixture' ? { 'data-jolene-fixture-launcher': true } : {})}
      >
        <span className="jolene-launcher-mark" aria-hidden="true">J</span>
        <span>
          <small>{connectionMode === 'live' ? 'Meet your guide' : 'Preview'}</small>
          Ask Jolene
        </span>
      </button>
    </div>
  );
}

export function JoleneFixtureChat({ scenario }: { scenario: string }) {
  return <JoleneChat mode="fixture" scenario={scenario} contactIntentEnabled />;
}
