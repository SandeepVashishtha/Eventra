import { describe, it, expect } from 'vitest';
import * as WithTimeout from '../with-timeout.js';

describe('with-timeout', () => {
  it('exports a module', () => {
    expect(WithTimeout).toBeDefined();
  });
});

