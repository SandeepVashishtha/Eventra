import { describe, it, expect } from 'vitest';
import { deduplicatePath } from '../deduplicate-path.js';

describe('deduplicate-path', () => {
  it('removes duplicate paths from a space separated list', () => {
    expect(deduplicatePath('/a /a /b')).toBe('/a /b');
    expect(deduplicatePath('/x /y /y')).toBe('/x /y');
    expect(deduplicatePath('')).toBe('');
  });
});
