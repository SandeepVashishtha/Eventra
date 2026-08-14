import { describe, it, expect } from 'vitest';
import { convertRecord } from '../convert-record.js';

describe('convert-record', () => {
  it('converts entries into an object', () => {
    expect(convertRecord([['a', 1], ['b', 2]])).toEqual({ a: 1, b: 2 });
    expect(convertRecord({ a: 1 })).toEqual({ a: 1 });
    expect(convertRecord([])).toEqual({});
  });
});
