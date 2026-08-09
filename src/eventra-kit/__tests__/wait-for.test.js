import { describe, it, expect } from 'vitest';
import * as WaitFor from '../wait-for.js';

describe('wait-for', () => {
  it('exports a module', () => {
    expect(WaitFor).toBeDefined();
  });
});

