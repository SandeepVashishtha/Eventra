import { describe, it, expect } from 'vitest';
import * as GetExtension from '../get-extension.js';

describe('get-extension', () => {
  it('exports a module', () => {
    expect(GetExtension).toBeDefined();
  });
});

