export const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
export const TOKEN_EXPIRATION = "15m";
export const REFRESH_EXPIRATION = "7d";

// En desarrollo (localhost/HTTP), secure debe ser false
// En producción (HTTPS), secure debe ser true
const isProduction = process.env.NODE_ENV === 'production';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction, // true solo en producción con HTTPS
  sameSite: "lax" as const, // "strict" puede causar problemas con redirects
};

export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
