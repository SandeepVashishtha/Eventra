import { describe, it, expect } from 'vitest';
import * as BuildJson from '../build-json.js';

describe('build-json', () => {
  it('exports a module', () => {
    expect(BuildJson).toBeDefined();
  });
});

