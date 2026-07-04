export const getSavedBookmarks = () => {
  const saved = localStorage.getItem("bookmarkedEvents");
  return saved ? JSON.parse(saved) : [];
};

export const toggleBookmark = (eventId) => {
  let savedBookmarks = getSavedBookmarks();

  if (savedBookmarks.includes(eventId)) {
    savedBookmarks = savedBookmarks.filter((id) => id !== eventId);
  } else {
    savedBookmarks.push(eventId);
  }

  localStorage.setItem("bookmarkedEvents", JSON.stringify(savedBookmarks));
  return savedBookmarks; // Return new state
};
