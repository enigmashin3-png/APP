import { describe, it, expect } from 'vitest';
import { CoachBodySchema } from './coach';

describe('CoachBodySchema', () => {
  it('accepts a minimal valid body', () => {
    const data = { messages: [{ role: 'user', content: 'hello' }] };
    const r = CoachBodySchema.safeParse(data);
    expect(r.success).toBe(true);
  });

  it('rejects empty messages', () => {
    const r = CoachBodySchema.safeParse({ messages: [] });
    expect(r.success).toBe(false);
  });

  it('rejects invalid roles', () => {
    const r = CoachBodySchema.safeParse({ messages: [{ role: 'systemX' as any, content: 'x' }] });
    expect(r.success).toBe(false);
  });
});

