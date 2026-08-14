import { describe, it, expect } from 'vitest';
import { dedupeUri } from '../dedupe-uri.js';

describe('dedupe-uri', () => {
  it('removes duplicate URIs while preserving order', () => {
    expect(dedupeUri(['https://a.dev', 'https://b.dev', 'https://a.dev'])).toEqual(['https://a.dev', 'https://b.dev']);
    expect(dedupeUri(['https://a.dev'])).toEqual(['https://a.dev']);
    expect(dedupeUri([])).toEqual([]);
  });
});
