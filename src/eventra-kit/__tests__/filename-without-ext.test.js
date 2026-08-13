import { describe, it, expect } from 'vitest';
import * as FilenameWithoutExt from '../filename-without-ext.js';

describe('filename-without-ext', () => {
  it('exports a module', () => {
    expect(FilenameWithoutExt).toBeDefined();
  });
});

