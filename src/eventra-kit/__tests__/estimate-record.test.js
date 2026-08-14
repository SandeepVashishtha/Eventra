import { describe, it, expect } from 'vitest';
import { estimateRecord } from '../estimate-record.js';

describe('estimate-record', () => {
  it('counts the number of fields in a record', () => {
    expect(estimateRecord({ a: 1, b: 2 })).toBe(2);
    expect(estimateRecord({})).toBe(0);
    expect(estimateRecord(null)).toBe(0);
  });
});
