export const normalizeFilterValue = (value) => {
  if (Array.isArray(value)) {
    return normalizeFilterValue(value[0]);
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const parsePrizeAmount = (prize) => {
  const amount = Number.parseInt(String(prize || "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(amount) ? amount : null;
};

export const matchesPrizeRange = (prize, prizeFilter) => {
  const selectedPrize = normalizeFilterValue(prizeFilter);

  if (!selectedPrize) {
    return true;
  }

  const prizeAmount = parsePrizeAmount(prize);

  if (prizeAmount === null) {
    return false;
  }

  if (selectedPrize === "Under $1,000") {
    return prizeAmount < 1000;
  }

  if (selectedPrize === "$1,000 - $5,000") {
    return prizeAmount >= 1000 && prizeAmount <= 5000;
  }

  if (selectedPrize === "$5,000+") {
    return prizeAmount >= 5000;
  }

  return String(prize || "").toLowerCase().includes(selectedPrize.toLowerCase());
};

export const filterHackathons = (
  hackathons,
  { activeTab = "all", filters = {}, selectedTags = [] } = {},
) => {
  const difficulty = normalizeFilterValue(filters.difficulty);
  const prize = normalizeFilterValue(filters.prize);
  const location = normalizeFilterValue(filters.location).toLowerCase();

  return hackathons.filter((hackathon) => {
    if (activeTab !== "all" && hackathon.status !== activeTab) {
      return false;
    }

    if (difficulty && hackathon.difficulty !== difficulty) {
      return false;
    }

    if (!matchesPrizeRange(hackathon.prize, prize)) {
      return false;
    }

    if (
      location &&
      !String(hackathon.location || "").toLowerCase().includes(location)
    ) {
      return false;
    }

    if (selectedTags.length > 0) {
      const hackathonTags = hackathon.techStack || [];
      return selectedTags.some((tag) => hackathonTags.includes(tag));
    }

    return true;
  });
};
