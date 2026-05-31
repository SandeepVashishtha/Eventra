export const getUserFullName = (user) =>
  [user?.firstName, user?.lastName]
    .map((name) =>
      typeof name === "string"
        ? name.trim()
        : typeof name === "number" && isFinite(name)
        ? String(name)
        : ""
    )
    .filter(Boolean)
    .join(" ");
