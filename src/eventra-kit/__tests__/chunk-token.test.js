import { describe, it, expect } from 'vitest';
import { chunkToken } from '../chunk-token.js';

describe('chunk-token', () => {
  it('splits text into tokens of the given size', () => {
    expect(chunkToken('abcdef', 2)).toEqual(['ab', 'cd', 'ef']);
    expect(chunkToken('abcdef', 3)).toEqual(['abc', 'def']);
    expect(chunkToken('abcde', 2)).toEqual(['ab', 'cd', 'e']);
  });
});
