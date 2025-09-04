import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }
    const key = process.env.GROQ_API_KEY;
    if (!key) {
      res.status(500).json({ error: 'Missing GROQ_API_KEY' });
      return;
    }
    const { messages, model } = (req.body ?? {}) as {
      messages?: Array<{ role: 'system'|'user'|'assistant'; content: string }>;
      model?: string;
    };
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
        messages: messages || [{ role: 'system', content: 'You are Lift Legends AI Coach.' }],
      }),
    });
    const j = await r.json();
    res.status(r.ok ? 200 : 500).json(j);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'coach failed' });
  }
}

