import { useMemo } from "react";
import PodiumCard from "./PodiumCard";

export default function LeaderboardPodium({ top3 }) {
  const podiumConfig = useMemo(() => [
    {
      position: "2nd",
      contributor: top3[1],
      orderClass: "order-2 md:order-1",
      styling: {
        borderClass: "border-slate-300 dark:border-slate-700",
        ringClass: "from-slate-200 to-zinc-400",
        title: "Platinum Contributor",
        badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
        size: "h-18 w-18",
        pointsClass: "text-slate-800 dark:text-slate-100",
        medalClass: "bg-slate-300 text-slate-800",
      },
    },
    {
      position: "1st",
      contributor: top3[0],
      orderClass: "order-1 md:order-2",
      styling: {
        borderClass: "border-yellow-400 dark:border-yellow-500",
        ringClass: "from-yellow-300 via-amber-400 to-yellow-500",
        title: "Grandmaster / Diamond Tier",
        badgeClass: "bg-yellow-400 text-yellow-950 shadow-[0_2px_10px_rgba(234,179,8,0.3)]",
        size: "h-22 w-22",
        pointsClass: "text-amber-500",
        medalClass: "bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950",
      },
      isFirst: true,
    },
    {
      position: "3rd",
      contributor: top3[2],
      orderClass: "order-3 md:order-3",
      styling: {
        borderClass: "border-amber-600 dark:border-orange-700",
        ringClass: "from-amber-600 to-orange-500",
        title: "Platinum Contributor",
        badgeClass: "bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-300 border border-orange-200/40",
        size: "h-18 w-18",
        pointsClass: "text-slate-800 dark:text-slate-100",
        medalClass: "bg-amber-600 text-white",
      },
    },
  ].filter((p) => p.contributor), [top3]);

  if (top3.length === 0) return null;

  return (
    <section className="mb-14" aria-labelledby="podium-heading">
      <h2 id="podium-heading" className="sr-only">Top 3 Contributors</h2>
      <div className="flex flex-col md:flex-row items-end justify-center gap-6 max-w-4xl mx-auto" role="list">
        {podiumConfig.map((podium) => (
          <PodiumCard
            key={podium.position}
            contributor={podium.contributor}
            position={podium.position}
            orderClass={podium.orderClass}
            styling={podium.styling}
            isFirst={podium.isFirst}
          />
        ))}
      </div>
    </section>
  );
}
