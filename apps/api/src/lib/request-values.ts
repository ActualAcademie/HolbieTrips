/** A JSON-shaped request body used by the small HTTP handlers in this API. */
export type RequestBody = Record<string, unknown>;

/**
 * Normalizes user-provided text and applies a defensive length limit before it
 * reaches business logic or persistence code.
 */
export function readText(value: unknown, maxLength = 500): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

/** Normalizes an e-mail address for lookup and uniqueness checks. */
export function readEmail(value: unknown): string {
  return readText(value, 254).toLowerCase();
}

/** Checks the canonical UUID shape accepted by PostgreSQL-backed routes. */
export function isUuid(value: unknown): value is string {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
