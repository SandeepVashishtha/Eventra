const shimmer =
  "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]";

export const SkeletonBlock = ({ className = "", ...props }) => (
  <div className={`${shimmer} rounded ${className}`} {...props} />
);

export const SkeletonEventCard = () => (
  <div aria-hidden="true" className="group relative bg-white dark:bg-gray-900 rounded-3xl shadow-xl flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800">
    <div className="flex items-center px-5 py-4 gap-4 bg-gradient-to-r from-white/80 to-indigo-50/60 dark:from-gray-900/80 dark:to-indigo-950/60 border-b border-gray-100 dark:border-gray-800">
      <SkeletonBlock className="w-10 h-10 rounded-xl" />
      <SkeletonBlock className="h-6 flex-1" />
      <SkeletonBlock className="h-6 w-16 rounded-full" />
    </div>

    <SkeletonBlock className="h-40 w-full" />

    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
      <SkeletonBlock className="h-4 w-full mb-2" />
      <SkeletonBlock className="h-4 w-5/6" />
    </div>

    <div className="px-5 py-4 grid grid-cols-2 gap-x-4 gap-y-3 bg-gray-50/50 dark:bg-gray-800/30">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <SkeletonBlock className="w-4 h-4 rounded" />
          <SkeletonBlock className="h-4 flex-1" />
        </div>
      ))}
    </div>

    <div className="px-5 py-4 flex gap-3 mt-auto">
      <SkeletonBlock className="h-12 flex-1 rounded-2xl" />
      <SkeletonBlock className="h-12 flex-1 rounded-2xl" />
    </div>
  </div>
);

export const EventCardSkeleton = SkeletonEventCard;

export const HomeCardSkeleton = () => (
  <div aria-hidden="true" className="flex flex-col rounded-xl overflow-hidden shadow-md bg-white dark:bg-black/60 min-h-[300px] sm:min-h-[360px] ring-2 ring-sky-200 dark:ring-sky-700/60 animate-pulse">
    <div className="p-4 sm:p-6 flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
        <SkeletonBlock className="h-6 w-24 rounded-full" />
        <SkeletonBlock className="h-5 w-16 rounded" />
      </div>

      <SkeletonBlock className="h-7 w-3/4 mb-4" />
      <SkeletonBlock className="h-4 w-full mb-2" />
      <SkeletonBlock className="h-4 w-full mb-2" />
      <SkeletonBlock className="h-4 w-2/3 mb-4" />

      <div className="flex items-center mb-2">
        <SkeletonBlock className="w-4 h-4 mr-2 rounded" />
        <SkeletonBlock className="h-4 w-32" />
      </div>

      <div className="flex items-center mt-4">
        <SkeletonBlock className="w-5 h-5 mr-2 rounded" />
        <SkeletonBlock className="h-4 w-40" />
      </div>
    </div>

    <div className="bg-gray-50 dark:bg-gray-700/50 px-4 sm:px-6 py-3 sm:py-4">
      <SkeletonBlock className="h-10 w-full rounded-md" />
    </div>
  </div>
);

export const ContributorCardSkeleton = ({ className = "", style = {} }) => (
  <div style={style} aria-hidden="true" className={`relative bg-white/95 dark:bg-gray-800/90 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center animate-pulse ${className}`}>
    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
      <SkeletonBlock className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 shadow-xl" />
    </div>

    <div className="mt-16 w-full flex flex-col items-center">
      <SkeletonBlock className="h-6 w-32 mb-2" />
      <SkeletonBlock className="h-4 w-24 mb-4" />
    </div>

    <div className="grid grid-cols-3 gap-3 my-5 w-full">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center bg-white/60 dark:bg-gray-600/50 p-2 rounded-lg"
        >
          <SkeletonBlock className="w-4 h-4 mb-2" />
          <SkeletonBlock className="h-4 w-8 mb-1" />
          <SkeletonBlock className="h-3 w-10" />
        </div>
      ))}
    </div>

    <SkeletonBlock className="w-full h-2 rounded-full mb-4" />

    <div className="flex flex-col gap-1 w-full items-center mb-4">
      <SkeletonBlock className="h-3 w-20" />
      <SkeletonBlock className="h-3 w-24" />
    </div>

    <SkeletonBlock className="h-10 w-32 rounded-full mt-auto" />
  </div>
);

export const GitHubStatCardSkeleton = () => (
  <div aria-hidden="true" className="group flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl px-3 py-4 sm:px-6 sm:py-6 md:px-8 shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden animate-pulse">
    <div className="z-10 flex flex-col items-center space-y-2 sm:space-y-3 w-full">
      <SkeletonBlock className="p-2 sm:p-3 md:p-4 h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full" />
      <SkeletonBlock className="h-6 w-16" />
      <SkeletonBlock className="h-4 w-20" />
    </div>
  </div>
);

export const LeaderboardStatCardSkeleton = () => (
  <div aria-hidden="true" className="p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-indigo-50 to-gray-50 dark:from-gray-800 dark:to-gray-900">
    <div className="flex items-center">
      <SkeletonBlock className="h-12 w-12 rounded-xl mr-4" />
      <div className="flex-1">
        <SkeletonBlock className="h-4 w-28 mb-3" />
        <SkeletonBlock className="h-8 w-16" />
      </div>
    </div>
  </div>
);

export const SkeletonLeaderboard = ({ rows = 10 }) => (
  <div aria-hidden="true" className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-500">
      <thead className="bg-gray-50 dark:bg-gray-900">
        <tr>
          {["Rank", "Contributor", "Points", "PRs"].map((col) => (
            <th
              key={col}
              className="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-black divide-y divide-gray-400 dark:divide-gray-500">
        {[...Array(rows)].map((_, i) => (
          <tr key={i} className="animate-pulse">
            <td className="px-6 py-4 whitespace-nowrap">
              <SkeletonBlock className="h-8 w-8 rounded-full mx-auto" />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <SkeletonBlock className="h-10 w-10 rounded-full" />
                <div className="ml-4">
                  <SkeletonBlock className="h-4 w-24 mb-2" />
                  <SkeletonBlock className="h-3 w-16" />
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <SkeletonBlock className="h-4 w-4 mr-1" />
                <SkeletonBlock className="h-4 w-12" />
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <SkeletonBlock className="h-4 w-4 mr-1" />
                <SkeletonBlock className="h-4 w-12" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const LeaderboardTableSkeleton = SkeletonLeaderboard;

export const SkeletonCalendar = ({ listItems = 3 }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" aria-hidden="true">
    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-7 w-44" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-9 w-9 rounded-xl" />
          <SkeletonBlock className="h-9 w-9 rounded-xl" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-2">
          {[...Array(7)].map((_, i) => (
            <SkeletonBlock key={i} className="h-4 rounded-md" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <SkeletonBlock
              key={i}
              className="aspect-square rounded-xl sm:rounded-2xl"
            />
          ))}
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-md">
      <SkeletonBlock className="h-6 w-48 mb-4" />
      <SkeletonBlock className="h-4 w-56 mb-6" />
      <div className="space-y-4">
        {[...Array(listItems)].map((_, i) => (
          <div
            key={i}
            className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/60"
          >
            <SkeletonBlock className="h-5 w-20 rounded-md mb-3" />
            <SkeletonBlock className="h-5 w-4/5 mb-3" />
            <SkeletonBlock className="h-4 w-2/3 mb-2" />
            <SkeletonBlock className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonProfileCard = () => (
  <div aria-hidden="true" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
    <div className="flex items-center gap-4">
      <SkeletonBlock className="h-16 w-16 rounded-full" />
      <div className="flex-1">
        <SkeletonBlock className="h-6 w-40 mb-3" />
        <SkeletonBlock className="h-4 w-28" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-3 mt-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
          <SkeletonBlock className="h-5 w-10 mb-2 mx-auto" />
          <SkeletonBlock className="h-3 w-14 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonTableRows = ({ rows = 5, columns = 4 }) => (
  <>
    {[...Array(rows)].map((_, rowIndex) => (
      <tr key={rowIndex} className="animate-pulse">
        {[...Array(columns)].map((__, columnIndex) => (
          <td key={columnIndex} className="px-4 py-3">
            <SkeletonBlock className="h-4 w-full" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export const HackathonCardSkeleton = () => (
  <div aria-hidden="true" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-blue-200 dark:border-gray-700 overflow-hidden">
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
  <div aria-hidden="true" className="bg-white dark:bg-indigo-950 rounded-xl shadow-md border border-blue-200 dark:border-gray-700 overflow-hidden flex flex-col">
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
  <div aria-hidden="true" className="ud-stat-card">
    <SkeletonBlock className="ud-stat-icon h-11 w-11 rounded-xl" />
    <div className="ud-stat-info flex-1">
      <SkeletonBlock className="h-3 w-20 mb-2" />
      <SkeletonBlock className="h-8 w-14 mb-2" />
      <SkeletonBlock className="h-3 w-32" />
    </div>
  </div>
);

export const DashboardQuickActionSkeleton = () => (
  <div aria-hidden="true" className="ud-quick-card">
    <SkeletonBlock className="ud-quick-icon h-10 w-10 rounded-xl" />
    <SkeletonBlock className="h-4 w-20" />
  </div>
);

export const DashboardListCardSkeleton = () => (
  <div aria-hidden="true" className="ud-card">
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
  <div aria-hidden="true" className="ud-item-card">
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
  <div aria-hidden="true">
    <SkeletonBlock className="h-4 w-28 mb-2" />
    <SkeletonBlock className="h-8 w-40" />
  </div>
);

export const DashboardSectionTitleSkeleton = () => (
  <SkeletonBlock className="h-6 w-40 mb-4" />
);

export const AdminStatCardSkeleton = () => (
  <div aria-hidden="true" className="ad-stat-card">
    <SkeletonBlock className="ad-stat-icon h-10 w-10 rounded-xl" />
    <div className="flex-1">
      <SkeletonBlock className="h-3 w-20 mb-2" />
      <SkeletonBlock className="h-7 w-12 mb-1" />
      <SkeletonBlock className="h-3 w-24" />
    </div>
  </div>
);

export const AdminTableSkeleton = ({ rows = 5 }) => (
  <div aria-hidden="true" className="ad-table-wrap">
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
  <div aria-hidden="true" className="ad-card">
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
  <div aria-hidden="true" className="ud-table-wrap">
    <table className="ud-table">
      <thead>
        <tr>
          {["Type", "Title", "Date", "Location", "Status", "Participation"].map(
            (col) => (
              <th key={col}>{col}</th>
            ),
          )}
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

export const EventDetailSkeleton = () => (
  <div aria-hidden="true" className="min-h-screen bg-white dark:bg-slate-950">
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <SkeletonBlock className="h-9 w-3/4" />
        <SkeletonBlock className="h-5 w-1/2" />
      </div>
      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap">
        {[...Array(4)].map((_, i) => (
          <SkeletonBlock key={i} className="h-10 w-32 rounded-full" />
        ))}
      </div>
      {/* Main grid */}
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        {/* Left */}
        <div className="space-y-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900">
          <SkeletonBlock className="h-96 w-full rounded-3xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <SkeletonBlock key={i} className="h-20 rounded-3xl" />
            ))}
          </div>
        </div>
        {/* Right */}
        <div className="space-y-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900">
          <SkeletonBlock className="h-24 rounded-3xl" />
          <SkeletonBlock className="h-32 rounded-3xl" />
          <SkeletonBlock className="h-40 rounded-3xl" />
        </div>
      </div>
    </div>
  </div>
);
export const SearchResultsSkeleton = ({ rows = 5 }) => (
  <div aria-hidden="true" className="p-4 flex flex-col gap-2">
    <SkeletonBlock className="h-3 w-24 mb-2" />
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-2 py-1.5 rounded-xl">
        <SkeletonBlock className="h-4 w-4 rounded flex-shrink-0" />
        <SkeletonBlock className={`h-4 rounded ${i % 2 === 0 ? "w-3/4" : "w-1/2"}`} />
      </div>
    ))}
  </div>
);

export const AuthFormSkeleton = () => (
  <div className="w-full max-w-md mx-auto space-y-8 p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
    <div className="text-center space-y-3">
      <SkeletonBlock className="h-9 w-2/3 mx-auto" />
      <SkeletonBlock className="h-4 w-5/6 mx-auto" />
    </div>
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-12 w-full rounded-xl" />
        </div>
      ))}
      <SkeletonBlock className="h-12 w-full rounded-xl mt-8" />
    </div>
    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
      <SkeletonBlock className="h-4 w-3/4 mx-auto" />
    </div>
  </div>
);

export const ExploreEventsSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
      <div className="space-y-4 flex-1">
        <SkeletonBlock className="h-10 w-2/3" />
        <SkeletonBlock className="h-5 w-1/2" />
      </div>
      <div className="flex gap-3">
        <SkeletonBlock className="h-12 w-32 rounded-xl" />
        <SkeletonBlock className="h-12 w-32 rounded-xl" />
      </div>
    </div>

    <div className="flex flex-wrap gap-3">
      {[...Array(6)].map((_, i) => (
        <SkeletonBlock key={i} className="h-10 w-24 rounded-full" />
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <SkeletonEventCard key={i} />
      ))}
    </div>
  </div>
);

/**
 * WaitlistSkeleton
 * Displayed in place of the waitlist join form while the event capacity
 * check / waitlist state is being fetched from the server.
 */
export const WaitlistSkeleton = () => (
  <div
    aria-hidden="true"
    aria-label="Loading waitlist information…"
    className="animate-pulse rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 p-6 space-y-4 w-full max-w-md"
  >
    {/* Header row — icon + title */}
    <div className="flex items-center gap-3">
      <SkeletonBlock className="h-10 w-10 rounded-xl flex-shrink-0 bg-amber-200/70 dark:bg-amber-800/40" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-5 w-40 bg-amber-200/70 dark:bg-amber-800/40" />
        <SkeletonBlock className="h-3 w-28 bg-amber-200/50 dark:bg-amber-800/30" />
      </div>
    </div>

    {/* Capacity bar */}
    <div className="space-y-1">
      <div className="flex justify-between">
        <SkeletonBlock className="h-3 w-24 bg-amber-200/60 dark:bg-amber-800/30" />
        <SkeletonBlock className="h-3 w-12 bg-amber-200/60 dark:bg-amber-800/30" />
      </div>
      <SkeletonBlock className="h-2 w-full rounded-full bg-amber-200/70 dark:bg-amber-800/40" />
    </div>

    {/* Queue position badge */}
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-100/60 dark:bg-amber-900/20">
      <SkeletonBlock className="h-6 w-6 rounded-full bg-amber-300/50 dark:bg-amber-700/40 flex-shrink-0" />
      <SkeletonBlock className="h-4 w-48 bg-amber-200/60 dark:bg-amber-800/30" />
    </div>

    {/* CTA button */}
    <SkeletonBlock className="h-12 w-full rounded-xl bg-amber-300/40 dark:bg-amber-700/30" />

    {/* Fine-print note */}
    <SkeletonBlock className="h-3 w-3/4 mx-auto bg-amber-200/50 dark:bg-amber-800/20" />
  </div>
);

/**
 * WaitlistPositionSkeleton
 * A compact inline skeleton for the "You are #N in the queue" badge that
 * appears after a user has joined the waitlist, while the position data is
 * still resolving.
 */
export const WaitlistPositionSkeleton = () => (
  <div
    aria-hidden="true"
    className="animate-pulse inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30"
  >
    <SkeletonBlock className="h-4 w-4 rounded-full bg-amber-300/60 dark:bg-amber-700/40" />
    <SkeletonBlock className="h-4 w-36 bg-amber-200/70 dark:bg-amber-800/40" />
  </div>
);

export const DashboardHomeSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-4 w-64" />
      </div>
      <SkeletonBlock className="h-10 w-32 rounded-lg" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <DashboardStatCardSkeleton key={i} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <SkeletonBlock className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <DashboardItemCardSkeleton key={i} />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <DashboardListCardSkeleton />
        <DashboardListCardSkeleton />
      </div>
    </div>
  </div>
);
