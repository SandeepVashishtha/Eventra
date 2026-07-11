// src/components/whatsnew/WhatsNewItem.jsx

const TYPE_STYLES = {
  new: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  improved: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  fixed: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

const TYPE_LABELS = {
  new: "New",
  improved: "Improved",
  fixed: "Fixed",
};

export default function WhatsNewItem({ entry }) {
  const { version, date, items } = entry;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          v{version}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      <ul className="space-y-1.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <span
              className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                TYPE_STYLES[item.type] || TYPE_STYLES.fixed
              }`}
            >
              {TYPE_LABELS[item.type] || item.type}
            </span>
            <span className="text-gray-700 dark:text-gray-300">
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}