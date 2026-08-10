import { describe, it, expect } from 'vitest';
import * as RandomId from '../random-id.js';

describe('random-id', () => {
  it('exports a module', () => {
    expect(RandomId).toBeDefined();
  });
});

