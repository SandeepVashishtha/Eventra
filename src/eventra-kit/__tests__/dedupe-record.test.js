import { describe, it, expect } from 'vitest';
import { dedupeRecord } from '../dedupe-record.js';

describe('dedupe-record', () => {
  it('removes duplicate records by key', () => {
    expect(dedupeRecord([{ id: 1 }, { id: 1 }, { id: 2 }])).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
