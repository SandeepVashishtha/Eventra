import { describe, it, expect } from 'vitest';
import * as HasOnlyAlphanumeric from '../has-only-alphanumeric.js';

describe('has-only-alphanumeric', () => {
  it('exports a module', () => {
    expect(HasOnlyAlphanumeric).toBeDefined();
  });
});

