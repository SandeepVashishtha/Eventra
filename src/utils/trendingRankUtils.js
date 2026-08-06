export const getTrendingBadge = (index) => {
  const badges = {
    0: "🏆 #1 Trending",
    1: "🥈 #2 Trending",
    2: "🥉 #3 Trending",
  };

  const numIndex = Number(index);
  return badges[numIndex] || `#${numIndex + 1} Trending`;
};