export const calculateRecommendationScore = (
  event,
  userProfile
) => {

  let score = 0;

  const reasons = [];

  // CATEGORY MATCH
  if (
    userProfile.interests?.includes(
      event.category
    )
  ) {
    score += 30;

    reasons.push(
      "Matches your interests"
    );
  }

  // TECH STACK MATCH
  if (
    event.techStack?.some((tech) =>
      userProfile.techStack?.includes(tech)
    )
  ) {
    score += 25;

    reasons.push(
      "Relevant to your tech stack"
    );
  }

  // EVENT TYPE MATCH
  if (
    userProfile.eventTypes?.includes(
      event.type
    )
  ) {
    score += 20;

    reasons.push(
      "Preferred event type"
    );
  }

  // LEVEL MATCH
  if (
    userProfile.level === event.level
  ) {
    score += 15;

    reasons.push(
      "Matches your experience level"
    );
  }

  // TRENDING BONUS
  if (event.trending) {

    score += 10;

    reasons.push(
      "Trending among developers"
    );
  }

  return {
    score,
    reasons,
  };
};