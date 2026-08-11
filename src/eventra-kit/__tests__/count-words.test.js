import { describe, it, expect } from 'vitest';
import * as CountWords from '../count-words.js';

describe('count-words', () => {
  it('exports a module', () => {
    expect(CountWords).toBeDefined();
  });
});

