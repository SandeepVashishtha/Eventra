import { describe, it, expect } from 'vitest';
import * as BuildStep from '../build-step.js';

describe('build-step', () => {
  it('exports a module', () => {
    expect(BuildStep).toBeDefined();
  });
});

