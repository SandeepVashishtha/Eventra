import { describe, it, expect } from 'vitest';
import { countText } from '../count-text.js';

describe('count-text', () => {
  it('counts the words in a text', () => {
    expect(countText('hello world')).toBe(2);
    expect(countText('')).toBe(0);
    expect(countText('one')).toBe(1);
  });
});
