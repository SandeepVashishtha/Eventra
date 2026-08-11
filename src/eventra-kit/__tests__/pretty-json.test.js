import { describe, it, expect } from 'vitest';
import * as PrettyJson from '../pretty-json.js';

describe('pretty-json', () => {
  it('exports a module', () => {
    expect(PrettyJson).toBeDefined();
  });
});

