const API_RATE_LIMIT = 60;
const API_RATE_WINDOW_S = 60;

const isRateLimited = async (ip) => {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) return false;

  const key = `rl:${ip}`;
  const headers = {
    Authorization: `Bearer ${kvToken}`,
    "Content-Type": "application/json",
  };

  const incrRes = await fetch(`${kvUrl}/incr/${key}`, {
    method: "POST",
    headers,
  });
  if (!incrRes.ok) return false;

  const { result: count } = await incrRes.json();

  if (count === 1) {
    await fetch(`${kvUrl}/expire/${key}/${API_RATE_WINDOW_S}`, {
      method: "POST",
      headers,
    });
  }

  return count > API_RATE_LIMIT;
};

export async function checkRateLimit(request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (await isRateLimited(ip)) {
    return { limited: true, ip, window: API_RATE_WINDOW_S };
  }
  return { limited: false, ip };
}
