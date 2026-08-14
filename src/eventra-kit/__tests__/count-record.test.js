import { describe, it, expect } from 'vitest';
import { countRecord } from '../count-record.js';

describe('count-record', () => {
  it('counts the records in a collection', () => {
    expect(countRecord([{ id: 1 }, { id: 2 }, { id: 3 }])).toBe(3);
    expect(countRecord([])).toBe(0);
    expect(countRecord(null)).toBe(0);
  });
});
