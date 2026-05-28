// 🔥 FIX: In-memory queue and lock to prevent localStorage race conditions
let isUpdating = false;
let interestQueue = [];

const processInterestQueue = () => {
  if (isUpdating || interestQueue.length === 0) return;
  isUpdating = true;

  try {
    const existing = JSON.parse(localStorage.getItem("eventra_user_profile")) || {};
    let interests = existing.interests || [];
    let modified = false;

    while (interestQueue.length > 0) {
      const interest = interestQueue.shift();
      if (!interests.includes(interest)) {
        interests.push(interest);
        modified = true;
      }
    }

    if (modified) {
      localStorage.setItem(
        "eventra_user_profile",
        JSON.stringify({ ...existing, interests })
      );
    }
  } catch (error) {
    console.error("Failed to update user interests:", error);
  } finally {
    isUpdating = false;
    if (interestQueue.length > 0) {
      processInterestQueue();
    }
  }
};

export const trackUserInterest = (interest) => {
  if (!interest) return;
  interestQueue.push(interest);
  processInterestQueue();
};