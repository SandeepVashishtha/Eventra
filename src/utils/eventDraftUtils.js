const STORAGE_KEY = "event_creation_draft";

export const saveDraft = (
  formData
) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(formData)
    );
  } catch (error) {
    console.error('Error saving draft:', error);
  }
};

export const getDraft = () => {
  try {
    const draft =
      localStorage.getItem(STORAGE_KEY);

    return draft
      ? JSON.parse(draft)
      : null;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

export const clearDraft = () => {
  try {
    localStorage.removeItem(
      STORAGE_KEY
    );
  } catch (error) {
    console.error('Error clearing draft:', error);
  }
};