import { describe, it, expect } from 'vitest';
import * as BuildBox from '../build-box.js';

describe('build-box', () => {
  it('exports a module', () => {
    expect(BuildBox).toBeDefined();
  });
});

