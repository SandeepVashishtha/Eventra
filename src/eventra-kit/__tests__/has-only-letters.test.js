import { describe, it, expect } from 'vitest';
import * as HasOnlyLetters from '../has-only-letters.js';

describe('has-only-letters', () => {
  it('exports a module', () => {
    expect(HasOnlyLetters).toBeDefined();
  });
});

