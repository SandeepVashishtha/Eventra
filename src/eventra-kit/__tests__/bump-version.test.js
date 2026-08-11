import { describe, it, expect } from 'vitest';
import * as BumpVersion from '../bump-version.js';

describe('bump-version', () => {
  it('exports a module', () => {
    expect(BumpVersion).toBeDefined();
  });
});

