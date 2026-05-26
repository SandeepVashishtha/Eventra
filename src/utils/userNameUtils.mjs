export const getUserFullName = (user) =>
  [user?.firstName, user?.lastName]
    .map((name) => (typeof name === "string" ? name.trim() : ""))
    .filter(Boolean)
    .join(" ");
