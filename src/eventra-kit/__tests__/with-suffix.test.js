import { describe, it, expect } from 'vitest';
import * as WithSuffix from '../with-suffix.js';

describe('with-suffix', () => {
  it('exports a module', () => {
    expect(WithSuffix).toBeDefined();
  });
});

