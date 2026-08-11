import { describe, it, expect } from 'vitest';
import * as RandomInt from '../random-int.js';

describe('random-int', () => {
  it('exports a module', () => {
    expect(RandomInt).toBeDefined();
  });
});

