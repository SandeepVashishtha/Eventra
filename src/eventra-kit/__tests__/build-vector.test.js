import { describe, it, expect } from 'vitest';
import { buildVector } from '../build-vector.js';

describe('build-vector', () => {
  it('builds a vector array from a value', () => {
    expect(buildVector([1, 2])).toEqual([1, 2]);
    expect(buildVector(3)).toEqual([3]);
    expect(buildVector('x')).toEqual(['x']);
  });
});
