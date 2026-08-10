import { describe, it, expect } from 'vitest';
import * as GetRandomString from '../get-random-string.js';

describe('get-random-string', () => {
  it('exports a module', () => {
    expect(GetRandomString).toBeDefined();
  });
});

