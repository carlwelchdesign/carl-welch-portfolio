import { handleSentryReconciliation } from '../../../observability/sentry-reconciliation-core.mjs';

export async function GET(request: Request): Promise<Response> {
  return handleSentryReconciliation(request, process.env);
}
