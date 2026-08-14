import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Heading2, Heading3 } from "lucide-react";
import { sanitizeHtml } from "utils/sanitizeHtml";
import { marked } from "marked";
import "./RichTextEditor.css";

/**
 * RichTextEditor Component
 * 
 * A WYSIWYG editor using TipTap for event descriptions.
 * Supports: H2, H3, Bold, Italic, Lists (bulleted & ordered), Links
 * Outputs sanitized HTML for safe rendering.
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current HTML content
 * @param {Function} props.onChange - Callback when content changes
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.maxLength - Maximum character limit
 * @param {boolean} props.readOnly - Whether editor is read-only
 * @param {Object} props.className - Additional CSS classes
 */
  // Character count extension
  const CharacterCount = Extension.create({
    name: "characterCount",
    
    addStorage() {
      return {
        characters: 0,
      };
    },
    
    onUpdate() {
      const characters = this.editor.getText().length;
      this.storage.characters = characters;
    },
  });

const RichTextEditor = forwardRef(({
  value = "",
  onChange,
  placeholder = "Write your event description here...",
  maxLength = 500,
  readOnly = false,
  className = "",
}, ref) => {
  // Custom extensions
  const CustomStarterKit = StarterKit.configure({
    // Only include the extensions we need for basic formatting
    bold: true,
    italic: true,
    bulletList: true,
    orderedList: true,
    heading: {
      levels: [2, 3], // Only H2 and H3
    },
    // Disable these from starter kit
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    history: true,
  });

  // Link extension with security attributes
  const SecureLink = Link.configure({
    // Auto-add security attributes to external links
    HTMLAttributes: {
      target: "_blank",
      rel: "noopener noreferrer",
    },
  });

  // Custom placeholder extension
  const CustomPlaceholder = Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === "heading") {
        return `Heading ${node.attrs.level}`;
      }
      return placeholder;
    },
  });

  const editor = useEditor({
    extensions: [
      CustomStarterKit,
      SecureLink,
      CustomPlaceholder,
      CharacterCount,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose prose-indigo dark:prose-invert max-w-none focus:outline-none min-h-[120px]",
      },
    },
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange({ target: { name: "description", value: html } });
      }
    },
    onBlur: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        // Also trigger blur handlers if they exist
        const event = { target: { name: "description", value: html } };
        if (typeof onChange === "function") {
          onChange(event);
        }
      }
    },
  });

  // Sync external value changes (e.g., form reset, initial load)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Check if the value is markdown that needs conversion
      const isMarkdown = !value || value.trim().startsWith("#") || 
                        value.includes("**") || value.includes("*") || 
                        /(^|\n)[-*]\s/.test(value) || /(^|\n)\d+\.\s/.test(value);
      
      if (isMarkdown && value) {
        // Convert markdown to HTML
        try {
          const htmlFromMarkdown = sanitizeHtml(marked.parse(value));
          editor.commands.setContent(htmlFromMarkdown);
        } catch {
          editor.commands.setContent(value);
        }
      } else {
        editor.commands.setContent(value || "");
      }
    }
  }, [value, editor]);

  // Expose editor methods via ref
  useImperativeHandle(ref, () => ({
    getContent: () => editor?.getHTML() || "",
    setContent: (content) => editor?.commands.setContent(content),
    focus: () => editor?.focus(),
    blur: () => editor?.commands.blur(),
  }));

  // Character counter
  const charCount = editor?.storage.characterCount?.characters || 0;
  const isOverLimit = charCount > maxLength;

  if (!editor) {
    return null;
  }

  // Toolbar component
  const Toolbar = () => (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-t-lg border border-b-0 border-gray-300 dark:border-gray-600">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors ${
          editor.isActive("heading", { level: 2 }) 
            ? "bg-indigo-100 dark:bg-indigo-900" 
            : ""
        }`}
        title="Heading 2"
        aria-label="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        disabled={!editor.can().chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors ${
          editor.isActive("heading", { level: 3 }) 
            ? "bg-indigo-100 dark:bg-indigo-900" 
            : ""
        }`}
        title="Heading 3"
        aria-label="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors ${
          editor.isActive("bold") ? "bg-indigo-100 dark:bg-indigo-900" : ""
        }`}
        title="Bold"
        aria-label="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors ${
          editor.isActive("italic") ? "bg-indigo-100 dark:bg-indigo-900" : ""
        }`}
        title="Italic"
        aria-label="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors ${
          editor.isActive("bulletList") ? "bg-indigo-100 dark:bg-indigo-900" : ""
        }`}
        title="Bullet List"
        aria-label="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors ${
          editor.isActive("orderedList") ? "bg-indigo-100 dark:bg-indigo-900" : ""
        }`}
        title="Numbered List"
        aria-label="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => {
          const url = window.prompt("Enter URL:");
          if (url) {
            // Sanitize the URL
            let sanitizedUrl = url.trim();
            
            // Add https:// if missing
            if (!sanitizedUrl.startsWith("http://") && !sanitizedUrl.startsWith("https://")) {
              sanitizedUrl = "https://" + sanitizedUrl;
            }
            
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: sanitizedUrl, target: "_blank", rel: "noopener noreferrer" })
              .run();
          }
        }}
        disabled={readOnly}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors ${
          editor.isActive("link") ? "bg-indigo-100 dark:bg-indigo-900" : ""
        }`}
        title="Insert Link"
        aria-label="Insert Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive("link")}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        title="Remove Link"
        aria-label="Remove Link"
      >
        <LinkIcon className="w-4 h-4 text-red-500" />
      </button>
    </div>
  );

  return (
    <div className={`rich-text-editor ${className}`}>
      {!readOnly && <Toolbar />}
      
      <div 
        className={`border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 ${
          readOnly ? "border-t" : "border-t-0"
        } ${isOverLimit ? "border-red-500" : ""}`}
      >
        <EditorContent editor={editor} />
      </div>
      
      {maxLength > 0 && (
        <div className="flex justify-end mt-1">
          <span 
            className={`text-xs ${isOverLimit ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
          >
            {charCount}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
});

export default RichTextEditor;