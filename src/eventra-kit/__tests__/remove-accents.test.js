import { describe, it, expect } from 'vitest';
import * as RemoveAccents from '../remove-accents.js';

describe('remove-accents', () => {
  it('exports a module', () => {
    expect(RemoveAccents).toBeDefined();
  });
});

