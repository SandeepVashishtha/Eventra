const SOCIAL_PROFILE_HOSTS = {
  github: new Set(["github.com", "www.github.com"]),
  linkedin: new Set(["linkedin.com", "www.linkedin.com"]),
};

export const sanitizeProfileUrl = (url, network) => {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) return "";

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed;
  try {
    parsed = new URL(withProtocol);
  } catch {
    return "";
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "";
  const allowed = SOCIAL_PROFILE_HOSTS[network];
  if (!allowed || !allowed.has(parsed.hostname.toLowerCase())) return "";
  return parsed.toString();
};
