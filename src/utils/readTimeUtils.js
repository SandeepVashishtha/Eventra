const WORDS_PER_MINUTE = 200;

const stripHtml = (value) => String(value).replace(/<[^>]*>/g, " ");

export const getWordCount = (text) => {
  if (text == null || text === "") return 0;

  const normalized = stripHtml(text).trim();
  if (!normalized) return 0;

  return normalized.split(/\s+/).filter(Boolean).length;
};

export const calculateReadTime = (text) => {
  if (text == null || text === "") return 0;

  const wordCount = getWordCount(text);
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
};

export const formatReadTime = (minutes) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return "";
  return `${Math.ceil(minutes)} min read`;
};

export const getEventReadTime = (event = {}) => {
  const description = event?.description;
  const minutes = calculateReadTime(description);

  return {
    minutes,
    display: formatReadTime(minutes),
    wordCount: getWordCount(description),
  };
};
