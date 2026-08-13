/**
 * Convert value to a valid number
 */
const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

/**
 * Calculate total budget
 */
export const calculateTotalBudget = (budget = {}) => {
  return (
    toNumber(budget.venue) +
    toNumber(budget.speakers) +
    toNumber(budget.food) +
    toNumber(budget.marketing) +
    toNumber(budget.merchandise) +
    toNumber(budget.prizePool) +
    toNumber(budget.miscellaneous)
  );
};

/**
 * Calculate cost per participant
 */
export const calculateCostPerParticipant = (
  totalBudget,
  participants
) => {
  const count = toNumber(participants);

  if (count <= 0) return 0;

  return totalBudget / count;
};

/**
 * Return expense breakdown
 */
export const getExpenseBreakdown = (budget = {}) => {
  return [
    {
      category: "Venue",
      amount: toNumber(budget.venue),
    },
    {
      category: "Speaker Fees",
      amount: toNumber(budget.speakers),
    },
    {
      category: "Food & Refreshments",
      amount: toNumber(budget.food),
    },
    {
      category: "Marketing",
      amount: toNumber(budget.marketing),
    },
    {
      category: "Merchandise",
      amount: toNumber(budget.merchandise),
    },
    {
      category: "Prize Pool",
      amount: toNumber(budget.prizePool),
    },
    {
      category: "Miscellaneous",
      amount: toNumber(budget.miscellaneous),
    },
  ];
};

/**
 * Find highest expense
 */
export const getHighestExpense = (budget = {}) => {
  const expenses = getExpenseBreakdown(budget);

  if (expenses.length === 0) {
    return {
      category: "",
      amount: 0,
    };
  }

  return expenses.reduce((highest, current) =>
    current.amount > highest.amount ? current : highest
  );
};

/**
 * Format currency
 */
export const formatCurrency = (
  value,
  currency = "INR",
  locale = "en-IN"
) => {
  const cleanCurrency = typeof currency === "string" && /^[A-Z]{3}$/.test(currency.trim()) ? currency.trim() : "INR";
  const cleanLocale = typeof locale === "string" && /^[a-z]{2}(-[A-Z]{2})?$/.test(locale.trim()) ? locale.trim() : "en-IN";
  return new Intl.NumberFormat(cleanLocale, {
    style: "currency",
    currency: cleanCurrency,
    maximumFractionDigits: 2,
  }).format(toNumber(value));
};

/**
 * Validate budget input
 */
export const validateBudgetInput = (budget = {}) => {
  const fields = [
    "venue",
    "speakers",
    "food",
    "marketing",
    "merchandise",
    "prizePool",
    "miscellaneous",
    "participants",
  ];

  return fields.every((field) => {
    const raw = budget[field];
    if (raw === "" || raw === null || raw === undefined) return false;
    const num = Number(raw);
    return Number.isFinite(num) && num >= 0;
  });
};

/**
 * Calculate expense percentages
 */
export const calculateExpensePercentage = (budget = {}) => {
  const total = calculateTotalBudget(budget);

  if (total === 0) return [];

  return getExpenseBreakdown(budget).map((item) => ({
    ...item,
    percentage: Number(
      ((item.amount / total) * 100).toFixed(2)
    ),
  }));
};