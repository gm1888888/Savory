/**
 * Validates a `?next=` style redirect target before it is ever passed to
 * `redirect()` or embedded in a form.
 *
 * `value.startsWith("/")` alone is NOT enough: "//evil.com" and "/\evil.com"
 * both pass that check yet browsers resolve them as absolute, off-site
 * navigations (protocol-relative and backslash-as-slash URLs). This is a
 * textbook open-redirect vector -- used here right after a real login, which
 * makes it an effective phishing pretext.
 *
 * A safe value must start with a single "/" and its second character must
 * be neither "/" nor "\".
 */
export function isSafeNextPath(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  if (!value.startsWith("/")) return false;
  const second = value[1];
  if (second === "/" || second === "\\") return false;
  return true;
}

/** Returns `value` if it is a safe same-origin path, otherwise `fallback`. */
export function safeNextPath(value: unknown, fallback = "/"): string {
  return isSafeNextPath(value) ? value : fallback;
}
