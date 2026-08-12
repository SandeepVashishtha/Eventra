import { describe, it, expect } from 'vitest';
import * as BuildBlock from '../build-block.js';

describe('build-block', () => {
  it('exports a module', () => {
    expect(BuildBlock).toBeDefined();
  });
});

