/**
 * useDragAndDrop.js
 *
 * Centralised drag-and-drop hook for file dropzones.
 * Handles isDragging state, drag counter (prevents flicker on child elements),
 * file validation, and keyboard/click accessibility fallback.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * The same dragover/dragleave/drop pattern was duplicated in 5+ components:
 *
 *   SubmitProject.js     — isDragging useState, 3 handlers, no drag counter
 *                          (causes isDragging flicker when hovering child elements)
 *   BulkImageUpload.jsx  — bare onDragOver/onDrop, no isDragging state
 *   EventCreation.jsx    — similar to SubmitProject, no drag counter
 *   ProjectSubmission.js — similar, no drag counter
 *   EventMediaSection    — uses onDrop inline, no isDragging visual
 *
 * Problems:
 *  1. isDragging flicker — without a drag counter, moving over child elements
 *     fires dragleave then dragenter, causing isDragging to briefly flash false
 *  2. No file validation in the drop handler — each component re-validates
 *  3. No keyboard accessibility — dropzones are not reachable via keyboard
 *  4. No multi-file support — each component handles one file differently
 *
 * FEATURES
 * --------
 *  1. Drag counter     — tracks enter/leave depth to prevent isDragging flicker
 *  2. File validation  — maxBytes and accept list checked on drop
 *  3. isDragging       — stable boolean for visual highlight
 *  4. isDragOver       — same as isDragging, aliased for readability
 *  5. getRootProps()   — spread onto the dropzone container element
 *  6. getInputProps()  — spread onto a hidden <input type="file"> for clicks
 *  7. open()           — programmatically open the file picker
 *  8. Multiple files   — optional via `multiple` option
 *
 * USAGE
 * -----
 *   const { getRootProps, getInputProps, isDragOver, error } = useDragAndDrop({
 *     onDrop: (files) => handleFiles(files),
 *     maxBytes: 5_242_880,
 *     accept: ["image/*"],
 *   });
 *
 *   <div {...getRootProps()} className={isDragOver ? "border-blue-500" : "border-gray-300"}>
 *     <input {...getInputProps()} />
 *     <p>Drag files here or click to upload</p>
 *     {error && <p className="text-red-500">{error}</p>}
 *   </div>
 */

import { useState, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatBytes = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const matchesMime = (file, accept) => {
  if (!accept || accept.length === 0) return true;
  return accept.some((pattern) => {
    if (pattern === "*/*") return true;
    if (pattern.endsWith("/*")) return file.type.startsWith(pattern.replace("/*", "/"));
    return file.type === pattern;
  });
};

const validateFiles = (fileList, { maxBytes, accept }) => {
  const valid = [];
  const errors = [];

  for (const file of fileList) {
    if (accept?.length && !matchesMime(file, accept)) {
      errors.push(`"${file.name}" has an unsupported file type.`);
      continue;
    }
    if (maxBytes && file.size > maxBytes) {
      errors.push(`"${file.name}" is too large (${formatBytes(file.size)}). Max: ${formatBytes(maxBytes)}.`);
      continue;
    }
    valid.push(file);
  }

  return { valid, errors };
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_OPTIONS = {
  onDrop:   null,
  maxBytes: null,
  accept:   [],
  multiple: false,
  disabled: false,
};

/**
 * useDragAndDrop
 *
 * @param {object}   options
 * @param {Function} options.onDrop      Called with File[] on valid drop
 * @param {number}   [options.maxBytes]  Max size per file in bytes
 * @param {string[]} [options.accept]    Accepted MIME types
 * @param {boolean}  [options.multiple]  Allow multiple files
 * @param {boolean}  [options.disabled]  Disable all drag interaction
 *
 * @returns {{
 *   isDragOver:    boolean,
 *   isDragging:    boolean,
 *   error:         string | null,
 *   getRootProps:  () => object,
 *   getInputProps: () => object,
 *   open:          () => void,
 * }}
 */
const useDragAndDrop = (options = {}) => {
  const { onDrop, maxBytes, accept, multiple, disabled } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);

  // Drag counter prevents isDragging flicker when cursor moves over child elements.
  // dragenter fires when entering any child, dragleave fires when leaving that child.
  // Without the counter, isDragging briefly becomes false between child elements.
  const dragCounterRef = useRef(0);
  const inputRef = useRef(null);

  const processFiles = useCallback((fileList) => {
    if (disabled || !fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const { valid, errors } = validateFiles(files, { maxBytes, accept });

    if (errors.length > 0) {
      setError(errors.join(" "));
      return;
    }

    setError(null);
    onDrop?.(multiple ? valid : [valid[0]]);
  }, [disabled, maxBytes, accept, multiple, onDrop]);

  // ── Drag handlers ─────────────────────────────────────────────────────────

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) setIsDragOver(false);
  }, [disabled]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    // Required to allow drop
    e.dataTransfer.dropEffect = "copy";
  }, [disabled]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    if (disabled) return;
    processFiles(e.dataTransfer.files);
  }, [disabled, processFiles]);

  // ── Click / keyboard handler ──────────────────────────────────────────────

  const handleClick = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleKeyDown = useCallback((e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleInputChange = useCallback((e) => {
    processFiles(e.target.files);
    // Reset so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }, [processFiles]);

  // ── open ──────────────────────────────────────────────────────────────────
  const open = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  // ── Prop getters ──────────────────────────────────────────────────────────

  const getRootProps = useCallback(() => ({
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver:  handleDragOver,
    onDrop:      handleDrop,
    onClick:     handleClick,
    onKeyDown:   handleKeyDown,
    role:        "button",
    tabIndex:    disabled ? -1 : 0,
    "aria-label": "File upload drop zone. Press Enter or Space to open file picker.",
    "aria-disabled": disabled,
  }), [handleDragEnter, handleDragLeave, handleDragOver, handleDrop, handleClick, handleKeyDown, disabled]);

  const getInputProps = useCallback(() => ({
    ref:      inputRef,
    type:     "file",
    multiple,
    accept:   accept?.join(",") || undefined,
    onChange: handleInputChange,
    style:    { display: "none" },
    tabIndex: -1,
    "aria-hidden": "true",
  }), [multiple, accept, handleInputChange]);

  return {
    isDragOver,
    isDragging: isDragOver, // alias
    error,
    getRootProps,
    getInputProps,
    open,
  };
};

export default useDragAndDrop;
