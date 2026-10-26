import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { assertLocal } from './lib/localGuard.server';

const clerk = clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname.startsWith('/sign-in')) return;
  const { userId } = await auth();
  if (!userId) {
    if (req.nextUrl.pathname.startsWith('/api/')) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    await auth.protect();
    return;
  }
  const allowed = new Set((process.env.ZI_GENERATION_PILOT_USERS || '').split(','));
  if (!allowed.has(userId)) return new Response('This Clerk account is not allowlisted for the synthetic local database.', { status: 403 });
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store');
  return response;
});
export default function proxy(req, event) {
  assertLocal();
  // Reject before any Clerk request handling, including forwarded public hosts.
  if (req.headers.get('host') !== 'localhost:3463' || req.headers.get('x-forwarded-host') && req.headers.get('x-forwarded-host') !== 'localhost:3463') return new Response('Local only', { status: 403 });
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers.get('origin') !== 'http://localhost:3463') return new Response('Local origin required', { status: 403 });
  return clerk(req, event);
}
export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|svg|woff2?|ico)).*)', '/(api|trpc)(.*)'],
};
