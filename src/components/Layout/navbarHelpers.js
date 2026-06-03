export const getUserDisplayNames = (user) => {
  if (!user) return { primary: "User", secondary: null };
  const primary =
    user.fullName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.username?.trim() ||
    user.email?.trim() ||
    "User";
  const secondaryCand = user.email?.trim() || user.username?.trim() || "";
  const secondary = secondaryCand && secondaryCand !== primary ? secondaryCand : null;
  return { primary, secondary };
};

export const clearBodyScrollStyles = () => {
  try {
    const stored = document.body.style.top;
    Object.assign(document.body.style, { position: "", top: "", left: "", right: "", width: "" });
    if (stored) window.scrollTo(0, parseInt(stored, 10) * -1 || 0);
  } catch (e) {
    /* ignore */
  }
};

export const setBodyScrollStyles = (top) => {
  Object.assign(document.body.style, {
    position: "fixed",
    top: `-${top}px`,
    left: "0",
    right: "0",
    width: "100%",
  });
};
