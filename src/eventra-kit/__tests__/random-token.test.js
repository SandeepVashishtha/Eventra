import { describe, it, expect } from 'vitest';
import * as RandomToken from '../random-token.js';

describe('random-token', () => {
  it('exports a module', () => {
    expect(RandomToken).toBeDefined();
  });
});

