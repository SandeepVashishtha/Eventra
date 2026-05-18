const shimmer =
  "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]";

const SkeletonBlock = ({ className = "" }) => (
  <div className={`${shimmer} rounded ${className}`} />
);

export const EventCardSkeleton = () => (
  <div className="group relative bg-white dark:bg-gray-900 rounded-3xl shadow-xl flex flex-col overflow-hidden">
    <div className="flex items-center px-8 py-6 gap-4 border-b border-gray-200/60 dark:border-gray-700/50">
      <SkeletonBlock className="w-12 h-12 rounded-2xl" />
      <SkeletonBlock className="h-6 flex-1" />
      <SkeletonBlock className="h-6 w-24 rounded-full" />
    </div>

    <SkeletonBlock className="h-64 w-full" />

    <div className="px-8 py-6 border-b border-gray-200/60 dark:border-gray-700/50">
      <SkeletonBlock className="h-4 w-full mb-2" />
      <SkeletonBlock className="h-4 w-5/6 mb-2" />
      <SkeletonBlock className="h-4 w-2/3" />
    </div>

    <div className="px-8 py-6 grid grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonBlock className="w-8 h-8 rounded-lg" />
          <SkeletonBlock className="h-4 flex-1" />
        </div>
      ))}
    </div>

    <div className="px-8 py-6 flex gap-4">
      <SkeletonBlock className="h-12 flex-1 rounded-2xl" />
      <SkeletonBlock className="h-12 flex-1 rounded-2xl" />
    </div>
  </div>
);

export const HackathonCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-blue-200 dark:border-gray-700 overflow-hidden">
    <div className="p-6 flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <SkeletonBlock className="h-6 w-20 rounded-full" />
          <SkeletonBlock className="h-6 w-24 rounded-full" />
        </div>
        <SkeletonBlock className="h-6 w-16 rounded-full" />
      </div>

      <SkeletonBlock className="h-px w-full" />

      <div>
        <SkeletonBlock className="h-6 w-3/4 mb-2" />
        <SkeletonBlock className="h-4 w-full mb-1" />
        <SkeletonBlock className="h-4 w-5/6" />
      </div>

      <SkeletonBlock className="h-px w-full" />

      <div className="flex items-center gap-2">
        <SkeletonBlock className="w-4 h-4 rounded" />
        <SkeletonBlock className="h-4 w-32" />
      </div>

      <SkeletonBlock className="h-px w-full" />

      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <SkeletonBlock className="w-4 h-4 rounded" />
            <SkeletonBlock className="h-4 w-40" />
          </div>
        ))}
      </div>

      <SkeletonBlock className="h-px w-full" />

      <div>
        <SkeletonBlock className="h-4 w-24 mb-2" />
        <div className="flex flex-wrap gap-2">
          {[...Array(4)].map((_, i) => (
            <SkeletonBlock key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      </div>

      <SkeletonBlock className="h-px w-full" />

      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center">
            <SkeletonBlock className="w-5 h-5 rounded mx-auto mb-1" />
            <SkeletonBlock className="h-5 w-8 mx-auto mb-1" />
            <SkeletonBlock className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>

      <SkeletonBlock className="h-px w-full" />

      <div className="flex items-center gap-2 p-3 rounded-lg">
        <SkeletonBlock className="w-5 h-5 rounded" />
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-4 w-24" />
      </div>

      <SkeletonBlock className="h-px w-full" />

      <div className="grid grid-cols-2 gap-3">
        <SkeletonBlock className="h-10 rounded-lg" />
        <SkeletonBlock className="h-10 rounded-lg" />
      </div>
    </div>
  </div>
);

export const ProjectCardSkeleton = () => (
  <div className="bg-white dark:bg-indigo-950 rounded-xl shadow-md border border-blue-200 dark:border-gray-700 overflow-hidden flex flex-col">
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-300 dark:border-gray-700">
      <SkeletonBlock className="w-10 h-10 rounded-full" />
      <SkeletonBlock className="h-5 flex-1 mx-3" />
      <SkeletonBlock className="h-5 w-16 rounded-full" />
    </div>

    <SkeletonBlock className="w-full aspect-[16/9]" />

    <div className="px-5 pt-4 pb-6 border-b border-gray-300 dark:border-gray-700">
      <SkeletonBlock className="h-4 w-full mb-2" />
      <SkeletonBlock className="h-4 w-5/6 mb-2" />
      <SkeletonBlock className="h-4 w-3/4" />
    </div>

    <div className="px-5 py-3 flex gap-2 border-b border-gray-300 dark:border-gray-700">
      <SkeletonBlock className="h-6 w-20 rounded-full" />
      <SkeletonBlock className="h-6 w-24 rounded-full" />
    </div>

    <div className="px-5 py-4 flex justify-between items-center border-b border-gray-300 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="w-8 h-8 rounded-full" />
        <SkeletonBlock className="h-4 w-20" />
      </div>
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <SkeletonBlock key={i} className="h-6 w-12 rounded-md" />
        ))}
      </div>
    </div>

    <div className="px-5 py-4 flex flex-wrap gap-2 border-b border-gray-300 dark:border-gray-700">
      {[...Array(4)].map((_, i) => (
        <SkeletonBlock key={i} className="h-6 w-16 rounded-full" />
      ))}
    </div>

    <div className="px-5 py-4 flex gap-3 mt-auto">
      <SkeletonBlock className="h-10 flex-1 rounded-lg" />
      <SkeletonBlock className="h-10 flex-1 rounded-lg" />
    </div>
  </div>
);

export const DashboardStatCardSkeleton = () => (
  <div className="ud-stat-card">
    <SkeletonBlock className="ud-stat-icon h-11 w-11 rounded-xl" />
    <div className="ud-stat-info flex-1">
      <SkeletonBlock className="h-3 w-20 mb-2" />
      <SkeletonBlock className="h-8 w-14 mb-2" />
      <SkeletonBlock className="h-3 w-32" />
    </div>
  </div>
);

export const DashboardQuickActionSkeleton = () => (
  <div className="ud-quick-card">
    <SkeletonBlock className="ud-quick-icon h-10 w-10 rounded-xl" />
    <SkeletonBlock className="h-4 w-20" />
  </div>
);

export const DashboardListCardSkeleton = () => (
  <div className="ud-card">
    <div className="ud-card-head">
      <SkeletonBlock className="h-8 w-8 rounded-lg" />
      <SkeletonBlock className="h-5 w-32" />
    </div>
    {[...Array(3)].map((_, i) => (
      <div key={i} className="ud-list-item">
        <div className="flex-1">
          <SkeletonBlock className="h-4 w-3/4 mb-2" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
        <SkeletonBlock className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

export const DashboardItemCardSkeleton = () => (
  <div className="ud-item-card">
    <div className="ud-item-top">
      <SkeletonBlock className="h-6 w-20 rounded-full" />
      <SkeletonBlock className="h-6 w-16 rounded-full" />
    </div>
    <SkeletonBlock className="h-5 w-4/5 mb-3" />
    <SkeletonBlock className="h-4 w-full mb-2" />
    <SkeletonBlock className="h-4 w-2/3 mb-4" />
    <SkeletonBlock className="h-6 w-24 rounded-full" />
  </div>
);

export const DashboardProfileSkeleton = () => (
  <div>
    <SkeletonBlock className="h-4 w-28 mb-2" />
    <SkeletonBlock className="h-8 w-40" />
  </div>
);

export const DashboardSectionTitleSkeleton = () => (
  <SkeletonBlock className="h-6 w-40 mb-4" />
);

export const AdminStatCardSkeleton = () => (
  <div className="ad-stat-card">
    <SkeletonBlock className="ad-stat-icon h-10 w-10 rounded-xl" />
    <div className="flex-1">
      <SkeletonBlock className="h-3 w-20 mb-2" />
      <SkeletonBlock className="h-7 w-12 mb-1" />
      <SkeletonBlock className="h-3 w-24" />
    </div>
  </div>
);

export const AdminTableSkeleton = ({ rows = 5 }) => (
  <div className="ad-table-wrap">
    <div className="ad-table">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="ad-table-row flex items-center gap-4 px-4 py-3">
          <SkeletonBlock className="h-4 w-1/4" />
          <SkeletonBlock className="h-4 w-1/3" />
          <SkeletonBlock className="h-6 w-16 rounded-full" />
          <SkeletonBlock className="h-4 w-20" />
        </div>
      ))}
    </div>
  </div>
);

export const AdminListCardSkeleton = () => (
  <div className="ad-card">
    <div className="ad-card-head">
      <SkeletonBlock className="h-8 w-8 rounded-lg" />
      <SkeletonBlock className="h-5 w-32" />
    </div>
    {[...Array(4)].map((_, i) => (
      <div key={i} className="ad-list-item">
        <SkeletonBlock className="ad-list-avatar h-8 w-8 rounded-full" />
        <div className="flex-1">
          <SkeletonBlock className="h-4 w-3/4 mb-2" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
        <SkeletonBlock className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

export const DashboardTableSkeleton = ({ rows = 5 }) => (
  <div className="ud-table-wrap">
    <table className="ud-table">
      <thead>
        <tr>
          {["Type", "Title", "Date", "Location", "Status", "Participation"].map(col => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(rows)].map((_, i) => (
          <tr key={i}>
            {[...Array(6)].map((__, j) => (
              <td key={j}>
                <SkeletonBlock className="h-4 w-full" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
