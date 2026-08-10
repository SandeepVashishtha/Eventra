import { describe, it, expect } from 'vitest';
import * as WordCount from '../word-count.js';

describe('word-count', () => {
  it('exports a module', () => {
    expect(WordCount).toBeDefined();
  });
});

