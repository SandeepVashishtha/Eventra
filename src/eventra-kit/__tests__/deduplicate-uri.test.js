import { describe, it, expect } from 'vitest';
import { deduplicateUri } from '../deduplicate-uri.js';

describe('deduplicate-uri', () => {
  it('removes duplicate URIs from a list', () => {
    expect(deduplicateUri(['/a', '/a', '/b'])).toEqual(['/a', '/b']);
    expect(deduplicateUri(['/x'])).toEqual(['/x']);
    expect(deduplicateUri([])).toEqual([]);
  });
});
