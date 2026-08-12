import { describe, it, expect } from 'vitest';
import * as BuildProp from '../build-prop.js';

describe('build-prop', () => {
  it('exports a module', () => {
    expect(BuildProp).toBeDefined();
  });
});

