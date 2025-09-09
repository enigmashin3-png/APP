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
    // Pass as unknown to avoid using any; schema should reject it
    const invalid = { messages: [{ role: 'systemX', content: 'x' }] } as unknown;
    const r = CoachBodySchema.safeParse(invalid);
    expect(r.success).toBe(false);
  });
});
