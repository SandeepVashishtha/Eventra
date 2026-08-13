import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const REQUIRED_FIELDS = [
  "name",
  "email",
];

const FIELD_OPTIONS = [
  {
    value: "name",
    label: "Participant Name",
  },
  {
    value: "email",
    label: "Email",
  },
  {
    value: "phone",
    label: "Phone",
  },
  {
    value: "team",
    label: "Team",
  },
  {
    value: "registrationId",
    label: "Registration ID",
  },
  {
    value: "category",
    label: "Category",
  },
];

const EventParticipantImport = ({
  existingParticipants = [],
  onImport,
  className = "",
}) => {
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);

  const [mapping, setMapping] = useState({});

  const [step, setStep] = useState("upload");

  const [errors, setErrors] = useState([]);

  const [duplicates, setDuplicates] =
    useState([]);

  const [importing, setImporting] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  const mappedRows = useMemo(() => {
    return rows.map((row) => {
      const participant = {};

      Object.entries(mapping).forEach(
        ([csvColumn, field]) => {
          if (!field) return;

          participant[field] =
            row[csvColumn]?.trim() || "";
        }
      );

      return participant;
    });
  }, [rows, mapping]);

  const validateMapping = () => {
    const mappedFields =
      Object.values(mapping).filter(Boolean);

    const missingFields =
      REQUIRED_FIELDS.filter(
        (field) =>
          !mappedFields.includes(field)
      );

    if (missingFields.length > 0) {
      setError(
        `Required fields missing: ${missingFields.join(
          ", "
        )}`
      );

      return false;
    }

    return true;
  };

  const validateRows = () => {
    const validationErrors = [];

    mappedRows.forEach(
      (participant, index) => {
        if (!participant.name) {
          validationErrors.push(
            `Row ${index + 2}: participant name is required.`
          );
        }

        if (!participant.email) {
          validationErrors.push(
            `Row ${index + 2}: email is required.`
          );
        } else if (
          !isValidEmail(
            participant.email
          )
        ) {
          validationErrors.push(
            `Row ${index + 2}: invalid email "${participant.email}".`
          );
        }
      }
    );

    setErrors(validationErrors);

    return validationErrors.length === 0;
  };

  const detectDuplicates = () => {
    const seen = new Set();
    const found = [];

    mappedRows.forEach(
      (participant, index) => {
        const email =
          participant.email
            ?.trim()
            .toLowerCase();

        if (!email) return;

        if (seen.has(email)) {
          found.push(
            `Row ${index + 2}: duplicate email "${email}" inside CSV.`
          );
        }

        seen.add(email);

        const alreadyExists =
          existingParticipants.some(
            (existing) =>
              existing.email
                ?.trim()
                .toLowerCase() ===
              email
          );

        if (alreadyExists) {
          found.push(
            `Row ${index + 2}: "${email}" already exists.`
          );
        }
      }
    );

    setDuplicates(found);

    return found;
  };

  const handleFile = (selectedFile) => {
    setError("");
    setSuccess("");
    setErrors([]);
    setDuplicates([]);

    if (!selectedFile) return;

    const extension =
      selectedFile.name
        .split(".")
        .pop()
        ?.toLowerCase();

    if (extension !== "csv") {
      setError(
        "Please upload a CSV file."
      );
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text =
          event.target.result;

        const parsed =
          parseCSV(text);

        if (
          !parsed.headers.length ||
          !parsed.rows.length
        ) {
          setError(
            "The CSV file does not contain usable participant data."
          );
          return;
        }

        setHeaders(parsed.headers);
        setRows(parsed.rows);

        const automaticMapping =
          createAutomaticMapping(
            parsed.headers
          );

        setMapping(
          automaticMapping
        );

        setStep("mapping");
      } catch {
        setError(
          "Unable to read the CSV file."
        );
      }
    };

    reader.onerror = () => {
      setError(
        "Unable to read the selected file."
      );
    };

    reader.readAsText(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const droppedFile =
      event.dataTransfer.files?.[0];

    handleFile(droppedFile);
  };

  const handleMappingChange = (
    header,
    field
  ) => {
    setMapping((current) => ({
      ...current,
      [header]: field,
    }));

    setError("");
  };

  const goToPreview = () => {
    if (!validateMapping()) return;

    if (!validateRows()) {
      setStep("preview");
      return;
    }

    detectDuplicates();

    setStep("preview");
  };

  const handleImport = async () => {
    setError("");
    setSuccess("");

    if (!validateMapping()) {
      return;
    }

    const validationPassed =
      validateRows();

    const foundDuplicates =
      detectDuplicates();

    if (!validationPassed) {
      setError(
        "Please fix the validation errors before importing."
      );
      return;
    }

    if (foundDuplicates.length > 0) {
      setError(
        "Duplicate participants were detected. Remove duplicates before importing."
      );
      return;
    }

    setImporting(true);

    try {
      await onImport?.(
        mappedRows
      );

      setSuccess(
        `${mappedRows.length} participant(s) imported successfully.`
      );

      setStep("complete");
    } catch (err) {
      setError(
        err?.message ||
          "Unable to import participants."
      );
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setStep("upload");
    setErrors([]);
    setDuplicates([]);
    setError("");
    setSuccess("");
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <FileSpreadsheet size={20} />
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Organizer Tools
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Import Participants
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Import participant lists from CSV files
            with validation and duplicate detection.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="mt-6 grid grid-cols-3 gap-2">
        <Step
          number="1"
          label="Upload"
          active={
            step === "upload"
          }
        />

        <Step
          number="2"
          label="Map & Preview"
          active={
            step === "mapping" ||
            step === "preview"
          }
        />

        <Step
          number="3"
          label="Complete"
          active={
            step === "complete"
          }
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[8px] font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          <AlertCircle
            size={14}
            className="mt-0.5 shrink-0"
          />
          <span>{error}</span>
        </div>
      )}

      {/* Upload */}
      {step === "upload" && (
        <div className="mt-6">
          <label
            htmlFor="participant-csv"
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={handleDrop}
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-5 py-12 text-center transition hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <Upload size={21} />
            </div>

            <p className="mt-4 text-sm font-bold text-slate-800 dark:text-white">
              Upload participant CSV
            </p>

            <p className="mt-1 text-[8px] text-slate-400">
              Drag and drop your CSV here or click to browse
            </p>

            <span className="mt-4 rounded-xl bg-indigo-600 px-4 py-3 text-[8px] font-bold text-white">
              Choose CSV File
            </span>

            <input
              id="participant-csv"
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) =>
                handleFile(
                  event.target.files?.[0]
                )
              }
            />
          </label>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-[8px] font-bold text-slate-700 dark:text-slate-200">
              Required CSV fields
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {REQUIRED_FIELDS.map(
                (field) => (
                  <span
                    key={field}
                    className="rounded-full bg-slate-100 px-3 py-1 text-[7px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {field}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mapping */}
      {step === "mapping" && (
        <div className="mt-6">
          <FileInfo
            file={file}
            rowCount={rows.length}
            onRemove={reset}
          />

          <div className="mt-5">
            <p className="text-[9px] font-bold text-slate-800 dark:text-white">
              Map CSV columns
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              Match each CSV column to a participant field.
            </p>

            <div className="mt-4 space-y-3">
              {headers.map(
                (header) => (
                  <div
                    key={header}
                    className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex items-center">
                      <span className="text-[8px] font-semibold text-slate-700 dark:text-slate-200">
                        {header}
                      </span>
                    </div>

                    <select
                      value={
                        mapping[header] ||
                        ""
                      }
                      onChange={(event) =>
                        handleMappingChange(
                          header,
                          event.target.value
                        )
                      }
                      className={inputClass}
                    >
                      <option value="">
                        Ignore column
                      </option>

                      {FIELD_OPTIONS.map(
                        (field) => (
                          <option
                            key={
                              field.value
                            }
                            value={
                              field.value
                            }
                          >
                            {field.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={reset}
              className={secondaryButton}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={goToPreview}
              className={primaryButton}
            >
              Preview Import
            </button>
          </div>
        </div>
      )}

      {/* Preview */}
      {step === "preview" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-800 dark:text-white">
                Import Preview
              </p>

              <p className="mt-1 text-[7px] text-slate-400">
                Review the participant data before importing.
              </p>
            </div>

            <span className="rounded-full bg-indigo-50 px-3 py-1 text-[7px] font-bold text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400">
              {mappedRows.length} rows
            </span>
          </div>

          {/* Validation errors */}
          {errors.length > 0 && (
            <ValidationBox
              title={`${errors.length} validation error(s)`}
              items={errors}
              type="error"
            />
          )}

          {/* Duplicate errors */}
          {duplicates.length > 0 && (
            <ValidationBox
              title={`${duplicates.length} duplicate(s) detected`}
              items={duplicates}
              type="warning"
            />
          )}

          {/* Table */}
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className={thClass}>
                    #
                  </th>

                  <th className={thClass}>
                    Name
                  </th>

                  <th className={thClass}>
                    Email
                  </th>

                  <th className={thClass}>
                    Phone
                  </th>

                  <th className={thClass}>
                    Team
                  </th>

                  <th className={thClass}>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {mappedRows
                  .slice(0, 20)
                  .map(
                    (
                      participant,
                      index
                    ) => {
                      const valid =
                        Boolean(
                          participant.name
                        ) &&
                        Boolean(
                          participant.email
                        ) &&
                        isValidEmail(
                          participant.email
                        );

                      return (
                        <tr
                          key={index}
                          className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                        >
                          <td className={tdClass}>
                            {index + 1}
                          </td>

                          <td className={tdClass}>
                            {participant.name ||
                              "—"}
                          </td>

                          <td className={tdClass}>
                            {participant.email ||
                              "—"}
                          </td>

                          <td className={tdClass}>
                            {participant.phone ||
                              "—"}
                          </td>

                          <td className={tdClass}>
                            {participant.team ||
                              "—"}
                          </td>

                          <td className={tdClass}>
                            <span
                              className={`rounded-full px-2 py-1 text-[6px] font-bold ${
                                valid
                                  ? "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400"
                                  : "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400"
                              }`}
                            >
                              {valid
                                ? "Valid"
                                : "Invalid"}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )}
              </tbody>
            </table>
          </div>

          {mappedRows.length > 20 && (
            <p className="mt-2 text-[7px] text-slate-400">
              Showing first 20 rows in preview. All{" "}
              {mappedRows.length} rows will be
              validated before import.
            </p>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                setStep("mapping")
              }
              className={secondaryButton}
            >
              Back to Mapping
            </button>

            <button
              type="button"
              disabled={
                importing ||
                errors.length > 0 ||
                duplicates.length > 0
              }
              onClick={handleImport}
              className={`${primaryButton} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {importing
                ? "Importing..."
                : `Import ${mappedRows.length} Participants`}
            </button>
          </div>
        </div>
      )}

      {/* Complete */}
      {step === "complete" && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-900/30 dark:bg-green-900/10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 size={27} />
          </div>

          <h3 className="mt-4 text-lg font-bold text-green-700 dark:text-green-400">
            Import Complete
          </h3>

          <p className="mt-2 text-[8px] text-green-700/70 dark:text-green-400/70">
            {success}
          </p>

          <button
            type="button"
            onClick={reset}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700"
          >
            Import Another File
          </button>
        </div>
      )}
    </section>
  );
};

const Step = ({
  number,
  label,
  active,
}) => (
  <div
    className={`rounded-xl p-3 text-center ${
      active
        ? "bg-indigo-600 text-white"
        : "bg-slate-100 text-slate-400 dark:bg-slate-800"
    }`}
  >
    <span className="text-[8px] font-black">
      {number}
    </span>

    <p className="mt-1 text-[7px] font-bold">
      {label}
    </p>
  </div>
);

const FileInfo = ({
  file,
  rowCount,
  onRemove,
}) => (
  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400">
        <FileSpreadsheet size={17} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[9px] font-bold text-slate-800 dark:text-white">
          {file?.name}
        </p>

        <p className="mt-1 text-[7px] text-slate-400">
          {rowCount} participant rows
        </p>
      </div>
    </div>

    <button
      type="button"
      onClick={onRemove}
      className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <X size={14} />
    </button>
  </div>
);

const ValidationBox = ({
  title,
  items,
  type,
}) => (
  <div
    className={`mt-4 rounded-2xl border p-4 ${
      type === "error"
        ? "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10"
        : "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10"
    }`}
  >
    <p
      className={`text-[8px] font-bold ${
        type === "error"
          ? "text-red-600 dark:text-red-400"
          : "text-amber-600 dark:text-amber-400"
      }`}
    >
      {title}
    </p>

    <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto">
      {items.map(
        (item, index) => (
          <li
            key={index}
            className="text-[7px] text-slate-500 dark:text-slate-400"
          >
            • {item}
          </li>
        )
      )}
    </ul>
  </div>
);

const createAutomaticMapping = (
  headers
) => {
  const result = {};

  headers.forEach((header) => {
    const normalized =
      header
        .toLowerCase()
        .trim()
        .replace(/[\s_-]+/g, "");

    if (
      ["name", "fullname", "participantname"].includes(
        normalized
      )
    ) {
      result[header] = "name";
    } else if (
      ["email", "emailaddress"].includes(
        normalized
      )
    ) {
      result[header] = "email";
    } else if (
      ["phone", "phonenumber", "mobile"].includes(
        normalized
      )
    ) {
      result[header] = "phone";
    } else if (
      ["team", "teamname"].includes(
        normalized
      )
    ) {
      result[header] = "team";
    } else if (
      ["registrationid", "registration"].includes(
        normalized
      )
    ) {
      result[header] =
        "registrationId";
    } else if (
      ["category", "participantcategory"].includes(
        normalized
      )
    ) {
      result[header] =
        "category";
    } else {
      result[header] = "";
    }
  });

  return result;
};

const parseCSV = (text) => {
  const lines = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && next === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      current += char;
      continue;
    }

    if (
      (char === "\n" ||
        char === "\r") &&
      !insideQuotes
    ) {
      if (current.trim()) {
        lines.push(current);
      }

      current = "";

      if (
        char === "\r" &&
        next === "\n"
      ) {
        i++;
      }

      continue;
    }

    current += char;
  }

  if (current.trim()) {
    lines.push(current);
  }

  if (lines.length < 2) {
    return {
      headers: [],
      rows: [],
    };
  }

  const headers = parseCSVLine(
    lines[0]
  );

  const rows = lines
    .slice(1)
    .map((line) => {
      const values =
        parseCSVLine(line);

      return headers.reduce(
        (result, header, index) => {
          result[header] =
            values[index] || "";

          return result;
        },
        {}
      );
    });

  return {
    headers,
    rows,
  };
};

const parseCSVLine = (
  line
) => {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (
      char === "," &&
      !insideQuotes
    ) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());

  return result;
};

const isValidEmail = (
  email
) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

const primaryButton =
  "rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700";

const secondaryButton =
  "rounded-xl border border-slate-200 bg-white px-5 py-3 text-[8px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";

const thClass =
  "px-4 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400";

const tdClass =
  "px-4 py-3 text-[8px] text-slate-600 dark:text-slate-300";

export default EventParticipantImport;