import { describe, it, expect } from 'vitest';
import * as BuildOrder from '../build-order.js';

describe('build-order', () => {
  it('exports a module', () => {
    expect(BuildOrder).toBeDefined();
  });
});

