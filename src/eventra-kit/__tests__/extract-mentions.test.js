import { describe, it, expect } from 'vitest';
import * as ExtractMentions from '../extract-mentions.js';

describe('extract-mentions', () => {
  it('exports a module', () => {
    expect(ExtractMentions).toBeDefined();
  });
});

