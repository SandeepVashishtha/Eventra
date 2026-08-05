export const createAsyncValidator = (validator, delayMs = 300) => {
  let timeoutId;
  let sequence = 0;

  return (value, ...args) => {
    const currentSequence = ++sequence;
    clearTimeout(timeoutId);

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          if (currentSequence !== sequence) return;
          resolve(await validator(value, ...args));
        } catch (error) {
          reject(error);
        }
      }, delayMs);
    });
  };
};

export const withRetry = (validator, maxAttempts = 3, delayMs = 250) => {
  const attempts = Math.max(1, maxAttempts);

  return async (...args) => {
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        return await validator(...args);
      } catch (error) {
        lastError = error;
        if (attempt < attempts && delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError;
  };
};

export const validatePasswordStrength = async (password) => {
  if (typeof password !== "string") {
    return "Password is required";
  }

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  return (
    (hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSymbol) ||
    "Password must include uppercase, lowercase, number, and symbol characters"
  );
};
