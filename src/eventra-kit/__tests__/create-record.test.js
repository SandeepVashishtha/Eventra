import { describe, it, expect } from 'vitest';
import { createRecord } from '../create-record.js';

describe('create-record', () => {
  it('builds a record from key/value pairs', () => {
    expect(createRecord([['a', 1], ['b', 2]])).toEqual({ a: 1, b: 2 });
    expect(createRecord([])).toEqual({});
  });
});
