import { describe, it, expect } from 'vitest';
import * as ExtractEntry from '../extract-entry.js';

describe('extract-entry', () => {
  it('exports a module', () => {
    expect(ExtractEntry).toBeDefined();
  });
});

