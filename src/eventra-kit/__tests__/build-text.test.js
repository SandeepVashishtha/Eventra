import { describe, it, expect } from 'vitest';
import * as BuildText from '../build-text.js';

describe('build-text', () => {
  it('exports a module', () => {
    expect(BuildText).toBeDefined();
  });
});

