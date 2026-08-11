import { describe, it, expect } from 'vitest';
import * as BuildObject from '../build-object.js';

describe('build-object', () => {
  it('exports a module', () => {
    expect(BuildObject).toBeDefined();
  });
});

