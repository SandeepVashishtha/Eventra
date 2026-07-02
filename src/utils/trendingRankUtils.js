export const getTrendingBadge = (index) => {
  const badges = {
    0: "🏆 #1 Trending",
    1: "🥈 #2 Trending",
    2: "🥉 #3 Trending",
  };

  return badges[index] || `#${index + 1} Trending`;
};