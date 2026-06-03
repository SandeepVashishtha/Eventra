export const getUserDisplayNames = (user) => {
  if (!user) return { primary: "User", secondary: null };

  const primary =
    user.fullName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.username ||
    user.email ||
    "User";

  const secondary =
    user.email && user.email !== primary ? user.email : null;

  return { primary, secondary };
};
