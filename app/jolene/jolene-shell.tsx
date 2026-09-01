import { JoleneChat } from './jolene-chat';

export function JoleneShell() {
  const mode = process.env.NEXT_PUBLIC_JOLENE_MODE;
  if (mode !== 'fixture' && mode !== 'live') return null;
  const fixtureAnswerDelayMs = Number.parseInt(process.env.JOLENE_FIXTURE_ANSWER_DELAY_MS ?? '', 10);

  return (
    <JoleneChat
      mode={mode}
      scenario={process.env.NEXT_PUBLIC_JOLENE_FIXTURE_SCENARIO || 'success'}
      contactIntentEnabled={process.env.JOLENE_PUBLIC_CONTACT_INTENT_ENABLED === 'true'}
      fixtureAnswerDelayMs={Number.isFinite(fixtureAnswerDelayMs) ? fixtureAnswerDelayMs : undefined}
    />
  );
}
