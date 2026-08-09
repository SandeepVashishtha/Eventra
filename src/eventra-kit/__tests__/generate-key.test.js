import { describe, it, expect } from 'vitest';
import * as GenerateKey from '../generate-key.js';

describe('generate-key', () => {
  it('exports a module', () => {
    expect(GenerateKey).toBeDefined();
  });
});

