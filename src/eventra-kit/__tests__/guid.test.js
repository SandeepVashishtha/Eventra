import { describe, it, expect } from 'vitest';
import * as Guid from '../guid.js';

describe('guid', () => {
  it('exports a module', () => {
    expect(Guid).toBeDefined();
  });
});

