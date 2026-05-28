export const trackUserInterest = (
  interest
) => {

  const existing =
    JSON.parse(
      localStorage.getItem(
        "eventra_user_profile"
      )
    ) || {};

  const interests =
    existing.interests || [];

  if (!interests.includes(interest)) {

    interests.push(interest);

  }

  localStorage.setItem(
    "eventra_user_profile",
    JSON.stringify({
      ...existing,
      interests,
    })
  );

};