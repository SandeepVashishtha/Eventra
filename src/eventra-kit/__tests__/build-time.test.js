import { describe, it, expect } from 'vitest';
import * as BuildTime from '../build-time.js';

describe('build-time', () => {
  it('exports a module', () => {
    expect(BuildTime).toBeDefined();
  });
});

