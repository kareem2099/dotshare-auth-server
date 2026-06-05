/**
 * Shared token utilities for the stateless broker.
 *
 * Every platform route should pass its raw provider response through
 * `withExpiryMeta` before returning it to the client.  This ensures the
 * client always has a reliable `expires_at` Unix timestamp it can compare
 * against `Date.now()` for proactive refresh — instead of discovering an
 * expired token at call-time.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** 7-day window before expiry where we flag `should_refresh_soon = true`. */
const REFRESH_SOON_WINDOW_SEC = 7 * 24 * 60 * 60;

/** Safe short-lived fallback when we have no valid `expires_in`. */
const SHORT_LIVED_FALLBACK_SEC = 3_600; // 1 hour

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise a raw `expires_in` value coming from any provider.
 * Returns a positive integer (seconds), or the supplied fallback.
 */
export function normalizeExpiresIn(
  raw: unknown,
  fallback: number = SHORT_LIVED_FALLBACK_SEC,
): number {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (Number.isFinite(n) && n > 0) return Math.floor(n);
  return fallback;
}



// ─── Main export ──────────────────────────────────────────────────────────────

export interface ExpiryMeta {
  /** Unix timestamp (seconds) when the access token expires. */
  expires_at: number;
  /** ISO-8601 string of the same deadline — useful for logging/display. */
  expires_at_iso: string;
  /**
   * True when the token will expire within REFRESH_SOON_WINDOW_SEC.
   * The client should proactively refresh if this is true.
   */
  should_refresh_soon: boolean;
}

/**
 * Enrich a raw provider token response with computed expiry metadata.
 *
 * @param data      Raw JSON from the provider (must contain `expires_in`).
 * @param fallback  Fallback seconds when `expires_in` is missing/invalid.
 *
 * @example
 * return NextResponse.json(withExpiryMeta(data));
 */
export function withExpiryMeta(
  data: Record<string, unknown>,
  fallback: number = SHORT_LIVED_FALLBACK_SEC,
): Record<string, unknown> & ExpiryMeta {
  const nowSec      = Math.floor(Date.now() / 1000);
  const expiresIn   = normalizeExpiresIn(data.expires_in, fallback);
  const expiresAt   = nowSec + expiresIn;

  return {
    ...data,
    expires_in:        expiresIn,                            // normalised
    expires_at:        expiresAt,                            // Unix ts
    expires_at_iso:    new Date(expiresAt * 1000).toISOString(),
    should_refresh_soon: (expiresAt - nowSec) < REFRESH_SOON_WINDOW_SEC,
  };
}


