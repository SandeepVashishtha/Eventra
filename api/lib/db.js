// In-memory user store for local development.
// Replace this module with a database adapter for production deployments.
// See: https://github.com/SandeepVashishtha/Eventra/issues/7940

const usersByEmail = new Map();
const usersById = new Map();
const usersByUsername = new Map();

export const userStore = {
  findByEmail(email) {
    if (!email) return null;
    return usersByEmail.get(email.toLowerCase()) ?? null;
  },

  findById(id) {
    if (!id) return null;
    return usersById.get(id) ?? null;
  },

  findByUsername(username) {
    if (!username) return null;
    return usersByUsername.get(username.toLowerCase()) ?? null;
  },

  save(user) {
    if (!user || !user.email) throw new Error("User must have an email");
    usersByEmail.set(user.email.toLowerCase(), user);
    if (user.id) usersById.set(user.id, user);
    if (user.username) usersByUsername.set(user.username.toLowerCase(), user);
    return user;
  },

  deleteByEmail(email) {
    if (!email) return false;
    const user = usersByEmail.get(email.toLowerCase());
    if (!user) return false;
    usersByEmail.delete(email.toLowerCase());
    if (user.id) usersById.delete(user.id);
    if (user.username) usersByUsername.delete(user.username.toLowerCase());
    return true;
  },

  clear() {
    usersByEmail.clear();
    usersById.clear();
    usersByUsername.clear();
  },

  get size() {
    return usersByEmail.size;
  },
};
