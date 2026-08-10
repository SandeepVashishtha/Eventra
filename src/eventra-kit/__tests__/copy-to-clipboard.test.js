import { describe, it, expect } from 'vitest';
import * as CopyToClipboard from '../copy-to-clipboard.js';

describe('copy-to-clipboard', () => {
  it('exports a module', () => {
    expect(CopyToClipboard).toBeDefined();
  });
});

