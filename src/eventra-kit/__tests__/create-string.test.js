import { describe, it, expect } from 'vitest';
import * as CreateString from '../create-string.js';

describe('create-string', () => {
  it('exports a module', () => {
    expect(CreateString).toBeDefined();
  });
});

