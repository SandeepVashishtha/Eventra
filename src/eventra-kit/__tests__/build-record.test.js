import { describe, it, expect } from 'vitest';
import * as BuildRecord from '../build-record.js';

describe('build-record', () => {
  it('exports a module', () => {
    expect(BuildRecord).toBeDefined();
  });
});

