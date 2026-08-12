import { describe, it, expect } from 'vitest';
import * as BuildDate from '../build-date.js';

describe('build-date', () => {
  it('exports a module', () => {
    expect(BuildDate).toBeDefined();
  });
});

