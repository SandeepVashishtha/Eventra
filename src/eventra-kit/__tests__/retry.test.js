import { describe, it, expect } from 'vitest';
import * as Retry from '../retry.js';

describe('retry', () => {
  it('exports a module', () => {
    expect(Retry).toBeDefined();
  });
});

