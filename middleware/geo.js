const getBlockedCountries = () => {
  return new Set(
    (process.env.BLOCKED_COUNTRIES || "")
      .split(",")
      .map((country) => country.trim().toUpperCase())
      .filter(Boolean)
  );
};

const isCountryBlocked = (country) => {
  const blockedCountries = getBlockedCountries();
  return blockedCountries.has(country?.toUpperCase());
};

const createGeoBlockedResponse = () =>
  new Response(
    JSON.stringify({
      error: "Unavailable For Legal Reasons",
      code: "COUNTRY_BLOCKED"
    }),
    {
      status: 451,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

export function checkGeoBlock(request) {
  const country = request.geo?.country;
  if (isCountryBlocked(country)) {
    console.warn(`[Geo Restriction] Blocked request from country: ${country}`);
    return createGeoBlockedResponse();
  }
  return null;
}
