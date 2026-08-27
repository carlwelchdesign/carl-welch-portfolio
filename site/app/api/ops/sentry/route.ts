import { handleSentryAsanaIntake } from '../../../observability/sentry-asana-intake-core.mjs';

export async function POST(request: Request): Promise<Response> {
  return handleSentryAsanaIntake(request, process.env);
}
