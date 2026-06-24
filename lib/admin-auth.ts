// Lightweight single-admin auth for the CMS.
// Gate is enabled only when ADMIN_PASSWORD is set; otherwise the admin is open
// (useful for local development / before a password is chosen).

export const ADMIN_COOKIE = "voltec_admin";

export function adminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

export function authEnabled(): boolean {
  return Boolean(adminPassword());
}

// The opaque session token stored in the httpOnly cookie. Derived from the
// password (or an explicit secret) so it stays stable across restarts.
export function sessionToken(): string {
  const explicit = process.env.ADMIN_SESSION_SECRET;
  if (explicit) return explicit;
  const pw = adminPassword() || "";
  return `voltec_sess_${pw}`;
}

export function isValidSession(cookieValue: string | undefined | null): boolean {
  if (!authEnabled()) return true;
  return Boolean(cookieValue) && cookieValue === sessionToken();
}
