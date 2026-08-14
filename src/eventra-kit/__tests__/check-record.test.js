import { describe, it, expect } from 'vitest';
import { checkRecord } from '../check-record.js';

describe('check-record', () => {
  it('checks whether a value is a record', () => {
    expect(checkRecord({ a: 1 })).toBe(true);
    expect(checkRecord([1])).toBe(false);
    expect(checkRecord(null)).toBe(false);
  });
});
