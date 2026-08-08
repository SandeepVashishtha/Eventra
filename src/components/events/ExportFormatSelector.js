import { FileText, FileSpreadsheet, FileDown } from "lucide-react";

const ExportFormatSelector = ({
  value = "csv",
  onChange,
}) => {
  const formats = [
    {
      id: "csv",
      label: "CSV",
      description: "Comma-separated values",
      icon: FileText,
    },
    {
      id: "excel",
      label: "Excel",
      description: "Excel spreadsheet",
      icon: FileSpreadsheet,
    },
    {
      id: "pdf",
      label: "PDF",
      description: "Printable document",
      icon: FileDown,
    },
  ];

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
        Select Export Format
      </h3>

      <div className="grid gap-3 sm:grid-cols-3">
        {formats.map((format) => {
          const Icon = format.icon;
          const selected = value === format.id;

          return (
            <button
              key={format.id}
              type="button"
              onClick={() => onChange?.(format.id)}
              aria-pressed={selected}
              className={`rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 dark:border-indigo-400 dark:bg-indigo-900/20 dark:ring-indigo-800"
                  : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    selected
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Icon size={20} />
                </div>

                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">
                    {format.label}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {format.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ExportFormatSelector;