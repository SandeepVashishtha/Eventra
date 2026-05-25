const STORAGE_KEY = "event_creation_draft";

export const saveDraft = (
  formData
) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(formData)
  );
};

export const getDraft = () => {
  const draft =
    localStorage.getItem(STORAGE_KEY);

  return draft
    ? JSON.parse(draft)
    : null;
};

export const clearDraft = () => {
  localStorage.removeItem(
    STORAGE_KEY
  );
};