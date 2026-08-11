import { describe, it, expect } from 'vitest';
import * as RandomFileName from '../random-file-name.js';

describe('random-file-name', () => {
  it('exports a module', () => {
    expect(RandomFileName).toBeDefined();
  });
});

