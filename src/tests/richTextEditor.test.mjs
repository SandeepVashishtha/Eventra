/**
 * Rich Text Editor Tests
 * Tests for the new WYSIWYG editor functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RichTextEditor from '../components/common/RichTextEditor';

// Mock the TipTap imports since they require DOM
vi.mock('@tiptap/react', () => ({
  useEditor: () => null,
  EditorContent: () => null,
  Extension: {
    create: () => ({}),
  },
}));

vi.mock('@tiptap/starter-kit', () => ({ default: {} }));
vi.mock('@tiptap/extension-link', () => ({ default: {} }));
vi.mock('@tiptap/extension-placeholder', () => ({ default: {} }));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Bold: () => null,
  Italic: () => null,
  Link: () => null,
  List: () => null,
  ListOrdered: () => null,
  Heading2: () => null,
  Heading3: () => null,
}));

// Mock utils
vi.mock('../utils/sanitizeHtml', () => ({
  sanitizeHtml: (html) => html,
}));

vi.mock('marked', () => ({
  parse: (md) => md,
}));

describe('RichTextEditor Component', () => {
  it('should render without crashing', () => {
    render(
      <RichTextEditor 
        value="Test content" 
        onChange={() => {}} 
      />
    );
    
    // Basic rendering test
    expect(screen.getByText(/Test content/i)).toBeInTheDocument();
  });

  it('should accept value prop', () => {
    render(
      <RichTextEditor 
        value="<p>Hello World</p>" 
        onChange={() => {}} 
      />
    );
    
    expect(screen.getByText(/Hello World/i)).toBeInTheDocument();
  });

  it('should call onChange when content changes', () => {
    const handleChange = vi.fn();
    render(
      <RichTextEditor 
        value="Initial content" 
        onChange={handleChange} 
      />
    );
    
    // Simulate a change event
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New content' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should respect maxLength prop', () => {
    render(
      <RichTextEditor 
        value="" 
        onChange={() => {}} 
        maxLength={100} 
      />
    );
    
    // Should show character counter
    expect(screen.getByText(/0\/100/i)).toBeInTheDocument();
  });

  it('should handle readOnly mode', () => {
    render(
      <RichTextEditor 
        value="Read only content" 
        onChange={() => {}} 
        readOnly={true} 
      />
    );
    
    // In read-only mode, toolbar should not be visible
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });
});

describe('Description Migration Utilities', () => {
  it('should detect markdown content', () => {
    const { isMarkdown } = await import('../utils/descriptionMigration');
    
    expect(isMarkdown('# Heading')).toBe(true);
    expect(isMarkdown('**bold**')).toBe(true);
    expect(isMarkdown('*italic*')).toBe(true);
    expect(isMarkdown('- list item')).toBe(true);
    expect(isMarkdown('[link](http://example.com)')).toBe(true);
    expect(isMarkdown('plain text')).toBe(false);
  });

  it('should convert markdown to HTML', () => {
    const { markdownToHtml } = await import('../utils/descriptionMigration');
    
    const html = markdownToHtml('# Heading\n\n**Bold text**');
    expect(html).toContain('<h1');
    expect(html).toContain('Bold text');
  });
});