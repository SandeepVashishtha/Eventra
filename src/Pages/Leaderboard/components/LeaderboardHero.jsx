import { Trophy } from "lucide-react";

export default function LeaderboardHero({ stats, currentContributors }) {
  return (
    <header className="mb-10 rounded-[32px] border border-slate-200/70 bg-white/85 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-600">
        <Trophy className="w-3 h-3" aria-hidden="true" />
        GSSoC&apos;26 Contribution Arena
      </div>

      <h1 id="leaderboard-heading" className="mt-5 text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950">
        Community{" "}
        <span className="bg-gradient-to-r from-slate-700 via-slate-500 to-slate-300 bg-clip-text text-transparent">
          Leaderboard
        </span>
      </h1>

      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
        A concise view of active contributors, ranked by impact, with live updates and a clear breakdown of points, PRs, and achievement tiers.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-500">
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">{stats.totalContributors} contributors</span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">{stats.flooredTotalPRs} merged PRs</span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">{currentContributors.length} shown on this page</span>
      </div>
    </header>
  );
}
