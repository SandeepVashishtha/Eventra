import { describe, it, expect } from 'vitest';
import * as DetectEntry from '../detect-entry.js';

describe('detect-entry', () => {
  it('exports a module', () => {
    expect(DetectEntry).toBeDefined();
  });
});

