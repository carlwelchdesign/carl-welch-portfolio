import { JoleneFixtureChat } from './jolene-chat';

export function JoleneShell() {
  if (process.env.NEXT_PUBLIC_JOLENE_MODE !== 'fixture') return null;

  return <JoleneFixtureChat scenario={process.env.NEXT_PUBLIC_JOLENE_FIXTURE_SCENARIO || 'success'} />;
}
