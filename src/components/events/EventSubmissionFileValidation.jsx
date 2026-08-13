import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  FileText,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_CONFIG = {
  maxFileSizeMB: 10,
  allowedFileTypes: [
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
  ],
  allowedExtensions: [".pdf", ".zip"],
  requiredFiles: ["Project Report"],
  requiredLinks: ["Project Repository"],
};

const EventSubmissionFileValidation = ({
  config = DEFAULT_CONFIG,
  onSubmit,
}) => {
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState({
    "Project Repository": "",
  });
  const [errors, setErrors] = useState([]);

  const validateFile = (file) => {
    const validationErrors = [];

    const extension = `.${file.name.split(".").pop().toLowerCase()}`;

    if (!config.allowedExtensions.includes(extension)) {
      validationErrors.push(
        `${file.name}: unsupported file type.`
      );
    }

    if (
      file.size >
      config.maxFileSizeMB * 1024 * 1024
    ) {
      validationErrors.push(
        `${file.name}: file exceeds ${config.maxFileSizeMB} MB.`
      );
    }

    if (
      file.name.length > 100
    ) {
      validationErrors.push(
        `${file.name}: filename is too long.`
      );
    }

    if (
      /[<>:"/\\|?*]/.test(
        file.name.replace(/\.[^/.]+$/, "")
      )
    ) {
      validationErrors.push(
        `${file.name}: contains invalid filename characters.`
      );
    }

    return validationErrors;
  };

  const handleFiles = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    const newErrors = [];
    const validFiles = [];

    selectedFiles.forEach((file) => {
      const fileErrors = validateFile(file);

      if (fileErrors.length > 0) {
        newErrors.push(...fileErrors);
      } else {
        validFiles.push(file);
      }
    });

    setFiles((current) => [
      ...current,
      ...validFiles,
    ]);

    setErrors(newErrors);
  };

  const removeFile = (index) => {
    setFiles((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const validation = useMemo(() => {
    const validationErrors = [...errors];

    config.requiredFiles.forEach((requiredFile) => {
      const exists = files.some((file) => {
        const name = file.name
          .toLowerCase()
          .replace(/\.[^/.]+$/, "");

        return name.includes(
          requiredFile.toLowerCase()
        );
      });

      if (!exists) {
        validationErrors.push(
          `Required file missing: ${requiredFile}`
        );
      }
    });

    config.requiredLinks.forEach((requiredLink) => {
      if (!links[requiredLink]?.trim()) {
        validationErrors.push(
          `Required link missing: ${requiredLink}`
        );
      }
    });

    return validationErrors;
  }, [files, links, errors, config]);

  const isValid = validation.length === 0;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!isValid) {
      setErrors(validation);
      return;
    }

    onSubmit?.({
      files,
      links,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <FileCheck2 size={21} />
        </div>

        <div>
          <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Submission Validation
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Validate Submission Files
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Check files and required links before submitting your project.
          </p>
        </div>
      </div>

      {/* Rules */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <RuleCard
          label="Maximum Size"
          value={`${config.maxFileSizeMB} MB`}
        />

        <RuleCard
          label="Allowed Types"
          value={config.allowedExtensions.join(", ")}
        />

        <RuleCard
          label="Required Files"
          value={config.requiredFiles.length}
        />
      </div>

      {/* Upload */}
      <div className="mt-6">
        <label className="mb-2 block text-[8px] font-bold text-slate-700 dark:text-slate-300">
          Project Files
        </label>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-5 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-500">
          <Upload
            size={25}
            className="text-indigo-500"
          />

          <span className="mt-3 text-[8px] font-bold text-slate-700 dark:text-slate-200">
            Upload project files
          </span>

          <span className="mt-1 text-[6px] text-slate-400">
            PDF or ZIP • Maximum {config.maxFileSizeMB} MB
          </span>

          <input
            type="file"
            multiple
            className="hidden"
            accept={config.allowedExtensions.join(",")}
            onChange={handleFiles}
          />
        </label>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex min-w-0 items-center gap-3">
                <FileText
                  size={16}
                  className="shrink-0 text-indigo-500"
                />

                <div className="min-w-0">
                  <p className="truncate text-[7px] font-bold text-slate-700 dark:text-slate-200">
                    {file.name}
                  </p>

                  <p className="text-[6px] text-slate-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeFile(index)}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Required Links */}
      <div className="mt-6 space-y-4">
        {config.requiredLinks.map((requiredLink) => (
          <div key={requiredLink}>
            <label className="mb-2 block text-[8px] font-bold text-slate-700 dark:text-slate-300">
              {requiredLink}
            </label>

            <input
              type="url"
              value={links[requiredLink] || ""}
              onChange={(event) =>
                setLinks((current) => ({
                  ...current,
                  [requiredLink]:
                    event.target.value,
                }))
              }
              placeholder="https://github.com/..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-[7px] outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        ))}
      </div>

      {/* Validation Status */}
      <div
        className={`mt-6 rounded-2xl border p-4 ${
          isValid
            ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10"
            : "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10"
        }`}
      >
        <div className="flex items-start gap-3">
          {isValid ? (
            <CheckCircle2
              size={18}
              className="shrink-0 text-green-600"
            />
          ) : (
            <AlertCircle
              size={18}
              className="shrink-0 text-amber-600"
            />
          )}

          <div>
            <p
              className={`text-[8px] font-bold ${
                isValid
                  ? "text-green-700 dark:text-green-400"
                  : "text-amber-700 dark:text-amber-400"
              }`}
            >
              {isValid
                ? "Submission is ready"
                : "Submission needs attention"}
            </p>

            {!isValid && (
              <ul className="mt-2 space-y-1">
                {validation.map((error, index) => (
                  <li
                    key={`${error}-${index}`}
                    className="text-[6px] text-amber-700 dark:text-amber-400"
                  >
                    • {error}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid}
        className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-[8px] font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
      >
        {isValid
          ? "Submit Project"
          : "Fix Validation Errors"}
      </button>
    </form>
  );
};

const RuleCard = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-2 text-sm font-black text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

const formatFileSize = (bytes) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default EventSubmissionFileValidation;