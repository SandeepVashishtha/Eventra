export const useAuth = () => {
  if (globalThis.mockAuth) {
    return globalThis.mockAuth();
  }
  return {
    token: null,
    user: null,
    isAuthenticated: () => false,
    loading: false,
  };
};
