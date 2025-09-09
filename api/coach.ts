import { z } from 'zod';
import * as SentryEdge from '@sentry/vercel-edge';

export const config = { runtime: 'edge' };

type Role = 'system' | 'user' | 'assistant';
type Msg = { role: Role; content: string };

const MAX_MESSAGES = Number(process.env.COACH_MAX_MESSAGES || 12);
const MAX_CONTENT_LEN = Number(process.env.COACH_MAX_CONTENT_LEN || 4000);
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
const ALLOWED_MODELS = (process.env.GROQ_ALLOWED_MODELS || 'llama-3.1-8b-instant,llama-3.1-70b-versatile')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Initialize Sentry for Edge (no-op if DSN missing)
try {
  if (process.env.SENTRY_DSN) {
    SentryEdge.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: Number(process.env.SENTRY_TRACES || 0.1),
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    });
  }
} catch (_err) {
  // Sentry is optional; ignore init failures
}

function isOriginAllowed(origin: string | null): string | null {
  const allow = (process.env.COACH_ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  // Automatically include Vercel preview/prod URL if present
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  if (vercelUrl && !allow.includes(vercelUrl)) allow.push(vercelUrl);
  if (!origin) return allow.length ? null : '*';
  if (allow.length === 0) return origin; // permissive if not configured
  return allow.includes(origin) ? origin : null;
}
function corsHeaders(origin: string | null) {
  const allowed = isOriginAllowed(origin);
  return {
    'Access-Control-Allow-Origin': allowed || 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-Id, X-Stream',
    'Vary': 'Origin',
    'Referrer-Policy': 'no-referrer',
  } as Record<string, string>;
}

function sanitizeMessages(input: unknown): Msg[] {
  if (!Array.isArray(input)) return [];
  const arr: ReadonlyArray<unknown> = input;
  const out: Msg[] = [];
  for (const m of arr.slice(-MAX_MESSAGES) as ReadonlyArray<{ role?: unknown; content?: unknown }>) {
    const role: Role | undefined = (['system', 'user', 'assistant'] as Role[]).includes(m?.role as Role)
      ? (m?.role as Role)
      : undefined;
    const content = typeof m?.content === 'string' ? (m.content as string).slice(0, MAX_CONTENT_LEN) : '';
    if (role && content) out.push({ role, content });
  }
  return out;
}

async function upstashIncr(key: string, ttlSeconds: number): Promise<number | null> {
  const base = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!base || !token) return null;
  const headers = { Authorization: `Bearer ${token}` } as Record<string, string>;
  const enc = encodeURIComponent(key);
  const r = await fetch(`${base}/incr/${enc}`, { headers, cache: 'no-store' });
  const j: unknown = await r.json();
  const result = (j as { result?: unknown })?.result;
  if (result === 1) {
    await fetch(`${base}/expire/${enc}/${ttlSeconds}`, { headers, cache: 'no-store' });
  }
  return typeof result === 'number' ? (result as number) : null;
}

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get('origin');
  const baseHeaders = { 'content-type': 'application/json; charset=utf-8', ...corsHeaders(origin) };
  const reqId = req.headers.get('x-request-id') || (globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
  const started = Date.now();
  if (!isOriginAllowed(origin)) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), { status: 403, headers: { ...baseHeaders, 'X-Request-Id': reqId } });
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: baseHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { ...baseHeaders, 'X-Request-Id': reqId } });
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: 'Missing GROQ_API_KEY' }), { status: 500, headers: { ...baseHeaders, 'X-Request-Id': reqId } });
  }

  // Parse + validate body
  const BodySchema = z.object({
    messages: z.array(z.object({ role: z.enum(['system', 'user', 'assistant']), content: z.string().min(1) })).min(1).max(MAX_MESSAGES),
    model: z.string().optional(),
  });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...baseHeaders, 'X-Request-Id': reqId } });
  }
  const parsed = BodySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid body', details: parsed.error.flatten() }), {
      status: 400,
      headers: { ...baseHeaders, 'X-Request-Id': reqId },
    });
  }

  const messages = sanitizeMessages(parsed.data.messages);
  const model = ALLOWED_MODELS.includes((parsed.data.model || '').trim()) ? parsed.data.model! : DEFAULT_MODEL;

  const u = new URL(req.url);
  const streamPreferred = u.searchParams.get('stream') === '1' || /text\/event-stream/.test(req.headers.get('accept') || '') || req.headers.get('x-stream') === '1';

  // Rate limiting using Upstash (if configured)
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const limit = Number(process.env.COACH_RPM || 60);
  let remaining = -1;
  const count = await upstashIncr(`coach:ip:${ip}:${Math.floor(Date.now() / 60000)}`, 60);
  if (count != null) remaining = Math.max(0, limit - count);
  if (count != null && count > limit) {
    console.log(JSON.stringify({
      at: new Date().toISOString(),
      reqId,
      ip,
      type: 'rate_limit',
      model,
      messages: messages.length,
      limit,
      count,
    }));
    return new Response(JSON.stringify({ error: 'Too Many Requests', retry_after: 60 }), {
      status: 429,
      headers: { ...baseHeaders, 'X-Request-Id': reqId, 'X-RateLimit-Limit': String(limit), 'X-RateLimit-Remaining': String(Math.max(0, remaining)), 'Retry-After': '60' },
    });
  }

  // Helper to fetch with timeout/retries (non-streaming only)
  async function fetchWithRetry(body: { model: string; messages: Msg[]; stream?: boolean }) {
    const tries = 2;
    const timeoutMs = Number(process.env.COACH_TIMEOUT_MS || 15000);
    for (let i = 0; i < tries; i++) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: ctrl.signal,
        });
        clearTimeout(t);
        return r;
      } catch (e) {
        clearTimeout(t);
        if (i === tries - 1) throw e;
      }
    }
    throw new Error('unreachable');
  }

  if (streamPreferred) {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, stream: true }),
    });
    const tookMs = Date.now() - started;
    console.log(JSON.stringify({ at: new Date().toISOString(), reqId, ip, type: 'coach_request_stream', model, messages: messages.length, status: r.status, tookMs }));
    return new Response(r.body, {
      status: r.ok ? 200 : 500,
      headers: {
        ...corsHeaders(origin),
        'X-Request-Id': reqId,
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
      },
    });
  }

  try {
    const r = await fetchWithRetry({ model, messages });
    const j = await r.json();
    const status = r.ok ? 200 : 500;
    const tookMs = Date.now() - started;
    console.log(JSON.stringify({
      at: new Date().toISOString(),
      reqId,
      ip,
      type: 'coach_request',
      model,
      messages: messages.length,
      status,
      tookMs,
    }));
    return new Response(JSON.stringify(j), {
      status,
      headers: { ...baseHeaders, 'X-Request-Id': reqId, 'X-RateLimit-Limit': String(limit), 'X-RateLimit-Remaining': String(remaining) },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('coach error', msg);
    try {
      SentryEdge.withScope?.((scope) => {
        scope.setTag('reqId', reqId);
        scope.setTag('model', model);
        scope.setContext('coach', { messages: messages.length, ip });
        SentryEdge.captureException(e);
      });
    } catch (_err) {
      // Ignore Sentry capture errors in edge
    }
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...baseHeaders, 'X-Request-Id': reqId },
    });
  }
}

// Export schema for tests
export const CoachBodySchema = z.object({
  messages: z.array(z.object({ role: z.enum(['system', 'user', 'assistant']), content: z.string().min(1) })).min(1).max(MAX_MESSAGES),
  model: z.string().optional(),
});

