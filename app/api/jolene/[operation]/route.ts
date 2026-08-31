import { handlePublicJoleneBff } from '../../../jolene/bff-handler';
import { bffOperations, type BffOperation } from '../../../jolene/bff-policy';

type RouteContext = { params: Promise<{ operation: string }> };

export async function GET(request: Request, context: RouteContext) {
  return route(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return route(request, context);
}

async function route(request: Request, context: RouteContext): Promise<Response> {
  const { operation } = await context.params;
  if (!bffOperations.includes(operation as BffOperation)) {
    return Response.json({ error: 'not_found' }, {
      status: 404,
      headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    });
  }
  return handlePublicJoleneBff(request, operation as BffOperation);
}
