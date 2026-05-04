/**
 * Shared regex / validation helpers for the auth screens.
 *
 * Keep these in sync with the server-side validators on the corresponding
 * DTOs (RegisterRequest, ConvertSessionRequest, AuthRequest). The intent is
 * a fail-fast UX hint — the backend remains the source of truth.
 */

/**
 * Indian mobile number, normalized to E.164 with the +91 country code.
 * - Country code +91 mandatory after normalisation
 * - Subscriber number is exactly 10 digits, must start with 6, 7, 8 or 9
 *   (per TRAI numbering plan; landline / DoT-only prefixes excluded)
 *
 * Accepts inputs like:
 *   "9876543210"        → normalized to "+919876543210" → matches
 *   "+919876543210"     → matches
 *   "+91 98765 43210"   → strip whitespace before testing
 */
export const PHONE_RE = /^\+91[6-9]\d{9}$/;

/**
 * Strip spaces / hyphens before validation; ensures the form accepts
 * "+91 98765 43210" / "+91-98765-43210" exactly the same as "+919876543210".
 */
export function normalizePhone(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim().replace(/[\s-]/g, '');
  if (trimmed.startsWith('+')) return trimmed;
  if (trimmed.length === 10) return `+91${trimmed}`;
  return trimmed;
}

/**
 * RFC-5322-lite email pattern. Sufficient to reject obviously malformed
 * input ("missing @", "missing TLD") without needing the full RFC grammar.
 *   local-part: letters, digits, dot, underscore, percent, plus, hyphen
 *   domain:     labels separated by dots, TLD ≥ 2 chars
 */
export const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/**
 * Strong password rule (used at registration time):
 *   • 8 to 72 characters (BCrypt's 72-byte input limit)
 *   • at least one lowercase letter
 *   • at least one UPPERCASE letter
 *   • at least one digit
 *   • at least one special character (!@#$%^&*()-_=+{};:,<.>?)
 *
 * Login uses LOGIN_PASSWORD_RE (length-only) since we only need a sanity
 * check — the backend compares against the stored BCrypt hash.
 */
export const STRONG_PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>?]).{8,72}$/;

/**
 * Lighter password rule for the login form: 8–72 chars, no character-class
 * checks. Don't tighten this — legacy accounts may have weaker passwords.
 */
export const LOGIN_PASSWORD_RE = /^.{8,72}$/;

/**
 * Return a human-readable reason a password fails STRONG_PASSWORD_RE,
 * or null if it passes. Useful for one-line hint messages.
 */
export function passwordWeakness(password: string): string | null {
  if (password.length === 0) return null; // don't nag empty input
  if (password.length < 8) return 'At least 8 characters.';
  if (password.length > 72) return 'Maximum 72 characters.';
  if (!/[a-z]/.test(password)) return 'Add at least one lowercase letter.';
  if (!/[A-Z]/.test(password)) return 'Add at least one UPPERCASE letter.';
  if (!/\d/.test(password)) return 'Add at least one number.';
  if (!/[!@#$%^&*()\-_=+{};:,<.>?]/.test(password))
    return 'Add at least one special character (e.g. @ # $ !).';
  return null;
}

/** True if the value is either a valid email OR a valid Indian phone. */
export function isValidIdentifier(value: string): boolean {
  if (!value) return false;
  const v = value.trim();
  return EMAIL_RE.test(v) || PHONE_RE.test(normalizePhone(v));
}
