import { describe, it, expect } from 'vitest';
import * as BuildStack from '../build-stack.js';

describe('build-stack', () => {
  it('exports a module', () => {
    expect(BuildStack).toBeDefined();
  });
});

