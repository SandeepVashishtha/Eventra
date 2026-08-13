import {
  FileText,
  FileSpreadsheet,
  FileImage,
  Link as LinkIcon,
  Download,
  ExternalLink,
  HelpCircle,
} from "lucide-react";

const ResourceCard = ({ resource }) => {
  if (!resource) return null;

  const getIcon = () => {
    switch (resource.type) {
      case "pdf":
        return <FileText className="text-red-500" size={34} />;

      case "ppt":
        return <FileSpreadsheet className="text-orange-500" size={34} />;

      case "image":
        return <FileImage className="text-green-500" size={34} />;

      case "faq":
        return <HelpCircle className="text-indigo-500" size={34} />;

      case "link":
        return <LinkIcon className="text-blue-500" size={34} />;

      default:
        return <FileText className="text-gray-500" size={34} />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300 p-5">

      {/* Icon */}

      <div className="flex justify-center mb-5">
        {getIcon()}
      </div>

      {/* Title */}

      <h3 className="text-lg font-bold text-center text-slate-800 dark:text-white">
        {resource.title}
      </h3>

      {/* Category */}

      <div className="mt-3 flex justify-center">
        <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
          {resource.category}
        </span>
      </div>

      {/* Description */}

      {resource.description && (
        <p className="mt-4 text-sm text-center text-slate-500 dark:text-slate-400 line-clamp-3">
          {resource.description}
        </p>
      )}

      {/* Actions */}

      <div className="mt-6 flex gap-3">

        {resource.url && (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 transition"
          >
            <ExternalLink size={16} />
            Open
          </a>
        )}

        {resource.downloadUrl && (
          <a
            href={resource.downloadUrl}
            download
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 py-2 transition"
          >
            <Download size={16} />
            Download
          </a>
        )}

      </div>
    </div>
  );
};

export default ResourceCard;