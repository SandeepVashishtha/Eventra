import { describe, it, expect } from 'vitest';
import * as TitleCaseWords from '../title-case-words.js';

describe('title-case-words', () => {
  it('exports a module', () => {
    expect(TitleCaseWords).toBeDefined();
  });
});

