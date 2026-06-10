export const getJwtSecret = () => process.env.JWT_SECRET || "dev-secret-change-in-production";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const JWT_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
