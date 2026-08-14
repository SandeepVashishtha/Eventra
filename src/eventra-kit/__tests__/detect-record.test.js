import { describe, it, expect } from 'vitest';
import { detectRecord } from '../detect-record.js';

describe('detect-record', () => {
  it('detects record objects', () => {
    expect(detectRecord({ name: 'ada' })).toBe(true);
    expect(detectRecord([1, 2])).toBe(false);
    expect(detectRecord(null)).toBe(false);
  });
});
