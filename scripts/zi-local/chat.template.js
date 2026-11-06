// Installed ONLY in the private development copy. No tutor/provider transport.
import { auth } from '@clerk/nextjs/server';
import { getUserAccessContext } from '@/lib/accessControl';
import { assertLocal } from '@/lib/localGuard.server';
import { ZiChatRequestSchema } from '@/lib/zi/validation';
import { checkZiRateLimit } from '@/lib/zi/rateLimit';
import { handleBuilder, parseBuilderText } from '@/lib/zi/testGenerator/builder.server';
import { ziChatReply } from '@/lib/zi/chatFrames';
import { generationPilotAllowed } from '@/lib/zi/testGenerator/jobPolicy';

const headers = { 'Cache-Control': 'no-store', 'X-Zi-Prompt-Charged': '0' };
const unavailable = () => Response.json({ code: 'LOCAL_MOCK_CHAT_UNAVAILABLE',
  error: 'General AI chat is unavailable in local mock mode. Ask to generate a JEE Main Physics test on Rotational Motion, then complete and confirm its configuration.' }, { status: 503, headers });

export async function POST(request) {
  assertLocal();
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401, headers });
  if (!generationPilotAllowed(userId)) return Response.json({ error: 'Local mock access is unavailable for this account.' }, { status: 403, headers });
  const parsed = ZiChatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid test request.' }, { status: 400, headers });
  const text = parsed.data.messages.at(-1).content;
  if (!parsed.data.testBuilderToken && !parseBuilderText(text).handled) return unavailable();
  try {
    const access = await getUserAccessContext({ userId });
    const rate = checkZiRateLimit(userId, access.plan);
    if (!rate.allowed) return Response.json({ error: 'Too many updates. Please try again shortly.' }, {
      status: 429, headers: { ...headers, 'Retry-After': String(Math.ceil(rate.resetMs / 1000)) },
    });
    const action = handleBuilder({ userId, access, text, token: parsed.data.testBuilderToken });
    if (!action) return unavailable();
    return ziChatReply(action.prompt, action);
  } catch (error) {
    return Response.json({ error: error.status ? error.message : 'Local test configuration is unavailable. Please retry.' }, { status: error.status || 503, headers });
  }
}
