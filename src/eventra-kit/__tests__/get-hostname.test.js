import { describe, it, expect } from 'vitest';
import * as GetHostname from '../get-hostname.js';

describe('get-hostname', () => {
  it('exports a module', () => {
    expect(GetHostname).toBeDefined();
  });
});

