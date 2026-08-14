import { describe, it, expect } from 'vitest';
import { countOccurrences } from '../count-occurrences.js';

describe('count-occurrences', () => {
  it('counts occurrences in strings and arrays', () => {
    expect(countOccurrences('banana', 'a')).toBe(3);
    expect(countOccurrences([1, 2, 1], 1)).toBe(2);
  });
});
