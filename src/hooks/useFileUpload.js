/**
 * useFileUpload.js
 *
 * Centralised file upload hook handling validation, preview generation,
 * FileReader base64 conversion, and object URL lifecycle management.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * FileReader and URL.createObjectURL were duplicated across 10+ files:
 *
 *   EditProfile.js           — FileReader, 1MB limit, alert() on error
 *   EventCreation.jsx        — FileReader, 5MB limit, setErrors() on error
 *   EventBadgeGenerator.jsx  — FileReader, no size check, no error handling
 *   EventMediaSection.jsx    — createObjectURL, revokes previous URL (best)
 *   EventMaterials.jsx       — createObjectURL, no revocation (leak)
 *   MultiTrackScheduleBuilder— createObjectURL, no revocation (leak)
 *   TicketQRCode.jsx         — createObjectURL, no revocation (leak)
 *   NotificationDropdown.jsx — inline createObjectURL, no revocation (leak)
 *
 * Problems:
 *  1. Object URL leaks — 6 of 8 files never call URL.revokeObjectURL()
 *  2. Inconsistent validation — 1MB limit vs 5MB limit vs no limit
 *  3. Inconsistent errors — alert() vs setErrors() vs silent failure
 *  4. No MIME type validation — any file can be uploaded to image fields
 *  5. No loading state — no visual feedback during FileReader processing
 *
 * FEATURES
 * --------
 *  1. FileReader base64  — async, with loading state and isMounted guard
 *  2. Object URL preview — auto-revokes previous URL on change or unmount
 *  3. Size validation    — configurable maxBytes with human-readable error
 *  4. MIME type validation — configurable accept list
 *  5. Multiple files     — optional multi-file mode
 *  6. Reset              — clears file, preview, and error state
 *
 * USAGE
 * -----
 *   // Base64 mode (for profile avatar, badge generator)
 *   const { file, preview, error, isProcessing, handleFileChange, reset } =
 *     useFileUpload({ mode: "base64", maxBytes: 1_048_576, accept: ["image/*"] });
 *
 *   // Object URL mode (for event banner, media section)
 *   const { file, preview, error, handleFileChange, reset } =
 *     useFileUpload({ mode: "objectUrl", maxBytes: 5_242_880 });
 *
 *   <input type="file" onChange={handleFileChange} accept="image/*" />
 *   {preview && <img src={preview} alt="Preview" />}
 *   {error && <p className="text-red-500">{error}</p>}
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const matchesMime = (file, accept) => {
  if (!accept || accept.length === 0) return true;
  return accept.some((pattern) => {
    if (pattern === "*/*") return true;
    if (pattern.endsWith("/*")) {
      return file.type.startsWith(pattern.replace("/*", "/"));
    }
    return file.type === pattern;
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_OPTIONS = {
  mode: "objectUrl",   // "objectUrl" | "base64"
  maxBytes: 5_242_880, // 5MB default
  accept: [],          // e.g. ["image/jpeg", "image/png", "image/*"]
  multiple: false,
};

/**
 * useFileUpload
 *
 * @param {object} options
 * @param {"objectUrl"|"base64"} [options.mode="objectUrl"]
 * @param {number}   [options.maxBytes=5242880]   Max file size in bytes
 * @param {string[]} [options.accept=[]]          Accepted MIME types
 * @param {boolean}  [options.multiple=false]     Allow multiple files
 *
 * @returns {{
 *   file:           File | null,
 *   files:          File[],
 *   preview:        string | null,
 *   previews:       string[],
 *   error:          string | null,
 *   isProcessing:   boolean,
 *   handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   reset:          () => void,
 * }}
 */
const useFileUpload = (options = {}) => {
  const { mode, maxBytes, accept, multiple } = { ...DEFAULT_OPTIONS, ...options };

  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isMountedRef = useRef(true);
  const prevPreviewRef = useRef(null);     // for single objectUrl revocation
  const prevPreviewsRef = useRef([]);      // for multi objectUrl revocation

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Revoke all object URLs on unmount
      if (prevPreviewRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(prevPreviewRef.current);
      }
      prevPreviewsRef.current.forEach((u) => {
        if (u?.startsWith("blob:")) URL.revokeObjectURL(u);
      });
    };
  }, []);

  // ── Revoke previous object URL before setting a new one ───────────────────
  const setPreviewSafe = useCallback((url) => {
    if (prevPreviewRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(prevPreviewRef.current);
    }
    prevPreviewRef.current = url;
    setPreview(url);
  }, []);

  // ── Validate a single file ────────────────────────────────────────────────
  const validate = useCallback((f) => {
    if (accept.length > 0 && !matchesMime(f, accept)) {
      const readableTypes = accept.join(", ").replace(/image\/\*/g, "images");
      return `Invalid file type. Accepted: ${readableTypes}.`;
    }
    if (f.size > maxBytes) {
      return `File is too large (${formatBytes(f.size)}). Maximum size is ${formatBytes(maxBytes)}.`;
    }
    return null;
  }, [accept, maxBytes]);

  // ── Process a single file (base64 or objectUrl) ───────────────────────────
  const processFile = useCallback(async (f) => {
    const validationError = validate(f);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setFile(f);

    if (mode === "base64") {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = () => {
        if (!isMountedRef.current) return;
        const result = typeof reader.result === "string" ? reader.result : "";
        setPreviewSafe(result);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        if (!isMountedRef.current) return;
        setError("Failed to read file. Please try again.");
        setIsProcessing(false);
      };
      reader.readAsDataURL(f);
    } else {
      // Object URL mode — synchronous, immediate preview
      const url = URL.createObjectURL(f);
      setPreviewSafe(url);
    }
  }, [mode, validate, setPreviewSafe]);

  // ── Main handler ──────────────────────────────────────────────────────────
  const handleFileChange = useCallback(async (e) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    if (multiple) {
      const fileList = Array.from(selected);
      // Revoke old previews
      prevPreviewsRef.current.forEach((u) => {
        if (u?.startsWith("blob:")) URL.revokeObjectURL(u);
      });

      const errors = [];
      const newPreviews = [];
      const validFiles = [];

      for (const f of fileList) {
        const err = validate(f);
        if (err) { errors.push(`${f.name}: ${err}`); continue; }
        validFiles.push(f);
        if (mode === "base64") {
          // base64 multi not supported — use objectUrl for multi
          newPreviews.push(URL.createObjectURL(f));
        } else {
          newPreviews.push(URL.createObjectURL(f));
        }
      }

      prevPreviewsRef.current = newPreviews;
      setFiles(validFiles);
      setPreviews(newPreviews);
      setError(errors.length > 0 ? errors.join(" ") : null);
    } else {
      await processFile(selected[0]);
    }
  }, [multiple, validate, processFile, mode]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setFile(null);
    setFiles([]);
    setError(null);
    setIsProcessing(false);

    // Revoke object URLs
    if (prevPreviewRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(prevPreviewRef.current);
    }
    prevPreviewRef.current = null;
    prevPreviewsRef.current.forEach((u) => {
      if (u?.startsWith("blob:")) URL.revokeObjectURL(u);
    });
    prevPreviewsRef.current = [];

    setPreview(null);
    setPreviews([]);
  }, []);

  return {
    file,
    files,
    preview,
    previews,
    error,
    isProcessing,
    handleFileChange,
    reset,
  };
};

export default useFileUpload;
