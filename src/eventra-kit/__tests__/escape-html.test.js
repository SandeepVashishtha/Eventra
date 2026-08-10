import { describe, it, expect } from 'vitest';
import * as EscapeHtml from '../escape-html.js';

describe('escape-html', () => {
  it('exports a module', () => {
    expect(EscapeHtml).toBeDefined();
  });
});

