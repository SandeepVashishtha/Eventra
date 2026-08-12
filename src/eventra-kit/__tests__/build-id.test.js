import { describe, it, expect } from 'vitest';
import * as BuildId from '../build-id.js';

describe('build-id', () => {
  it('exports a module', () => {
    expect(BuildId).toBeDefined();
  });
});

