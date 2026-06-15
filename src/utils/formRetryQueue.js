/**
 * formRetryQueue.js
 * Saves form data to localStorage when submission fails due to network issues.
 * Allows users to retry without losing their input.
 */

const QUEUE_KEY = "eventra_form_retry_queue";

export const saveFormData = (formId, data) => {
  try {
    const queue = getQueue();
    queue[formId] = { data, savedAt: new Date().toISOString() };
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return true;
  } catch {
    return false;
  }
};

export const getFormData = (formId) => {
  try {
    const queue = getQueue();
    return queue[formId] || null;
  } catch {
    return null;
  }
};

export const clearFormData = (formId) => {
  try {
    const queue = getQueue();
    delete queue[formId];
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return true;
  } catch {
    return false;
  }
};

export const getQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "{}");
  } catch {
    return {};
  }
};

export const hasSavedData = (formId) => {
  return Boolean(getFormData(formId));
};