import { describe, it, expect } from 'vitest';
import * as CreateFile from '../create-file.js';

describe('create-file', () => {
  it('exports a module', () => {
    expect(CreateFile).toBeDefined();
  });
});

