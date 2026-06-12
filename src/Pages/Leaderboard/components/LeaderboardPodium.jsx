import PodiumCard from "./PodiumCard";

export default function LeaderboardPodium({ top3, podiumConfig }) {
  if (!podiumConfig || top3.length === 0) return null;

  return (
    <section className="mb-14" aria-labelledby="podium-heading">
      <h2 id="podium-heading" className="sr-only">
        Top 3 Contributors
      </h2>
      <div
        className="mx-auto flex max-w-4xl flex-col items-end justify-center gap-6 md:flex-row"
        role="list"
      >
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
