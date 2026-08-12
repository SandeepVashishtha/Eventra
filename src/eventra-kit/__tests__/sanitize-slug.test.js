import { describe, it, expect } from 'vitest';
import * as SanitizeSlug from '../sanitize-slug.js';

describe('sanitize-slug', () => {
  it('exports a module', () => {
    expect(SanitizeSlug).toBeDefined();
  });
});

