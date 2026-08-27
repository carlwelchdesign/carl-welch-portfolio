import { JoleneChat } from './jolene-chat';

export function JoleneShell() {
  const mode = process.env.NEXT_PUBLIC_JOLENE_MODE;
  if (mode !== 'fixture' && mode !== 'live') return null;

  return <JoleneChat mode={mode} scenario={process.env.NEXT_PUBLIC_JOLENE_FIXTURE_SCENARIO || 'success'} />;
}
