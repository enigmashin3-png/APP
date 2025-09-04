import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

type Role = 'system' | 'user' | 'assistant';
type Msg = { role: Role; content: string };

const MAX_MESSAGES = Number(process.env.COACH_MAX_MESSAGES || 12);
const MAX_CONTENT_LEN = Number(process.env.COACH_MAX_CONTENT_LEN || 4000);
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
const ALLOWED_MODELS = (process.env.GROQ_ALLOWED_MODELS || 'llama-3.1-8b-instant,llama-3.1-70b-versatile')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

function clientIp(req: VercelRequest): string {
  const xf = (req.headers['x-forwarded-for'] as string) || '';
  return (xf.split(',')[0] || (req.socket as any)?.remoteAddress || 'unknown').trim();
}

// very small in-memory rate limiter (best-effort in serverless)
const g: any = globalThis as any;
if (!g.__COACH_RL__) g.__COACH_RL__ = new Map<string, { count: number; reset: number }>();
const rl: Map<string, { count: number; reset: number }> = g.__COACH_RL__;

function rateLimit(key: string, limit = Number(process.env.COACH_RPM || 20)) {
  const now = Date.now();
  const cur = rl.get(key);
  if (!cur || now > cur.reset) {
    rl.set(key, { count: 1, reset: now + 60_000 });
    return { ok: true } as const;
  }
  if (cur.count >= limit) return { ok: false, retryAfter: Math.ceil((cur.reset - now) / 1000) } as const;
  cur.count += 1;
  return { ok: true } as const;
}

function sanitizeMessages(input: any): Msg[] {
  if (!Array.isArray(input)) return [];
  const out: Msg[] = [];
  for (const m of input.slice(-MAX_MESSAGES)) {
    const role: Role | undefined = (['system', 'user', 'assistant'] as Role[]).includes(m?.role)
      ? m.role
      : undefined;
    const content = typeof m?.content === 'string' ? m.content.slice(0, MAX_CONTENT_LEN) : '';
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
  const r = await fetch(`${base}/incr/${enc}`, { headers });
  const j = (await r.json()) as any;
  if (j?.result === 1) {
    await fetch(`${base}/expire/${enc}/${ttlSeconds}`, { headers });
  }
  return typeof j?.result === 'number' ? j.result : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const ip = clientIp(req);
    const rr = rateLimit(ip);
    if (!rr.ok) {
      res.status(429).json({ error: 'Too Many Requests', retry_after: rr.retryAfter });
      return;
    }

    const key = process.env.GROQ_API_KEY;
    if (!key) {
      res.status(500).json({ error: 'Missing GROQ_API_KEY' });
      return;
    }

    const BodySchema = z.object({
      messages: z
        .array(z.object({ role: z.enum(["system", "user", "assistant"]), content: z.string().min(1) }))
        .min(1)
        .max(MAX_MESSAGES),
      model: z.string().optional(),
    });
    const parsed = BodySchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid body', details: parsed.error.flatten() });
      return;
    }
    const messages = sanitizeMessages(parsed.data.messages);
    const model = ALLOWED_MODELS.includes((parsed.data.model || '').trim()) ? parsed.data.model! : DEFAULT_MODEL;

    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages }),
    });
    const j = await r.json();
    res.status(r.ok ? 200 : 500).json(j);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'coach failed' });
  }
}

