/**
 * A fetch wrapper that gives up rather than hanging forever.
 *
 * Without this, an unreachable or mistyped NEXT_PUBLIC_SUPABASE_URL leaves
 * server rendering blocked on a socket that never answers, and the visitor
 * stares at a loading skeleton indefinitely. Ten seconds is generous for a
 * database round trip and still short enough to fail into a real error
 * message.
 */
const REQUEST_TIMEOUT_MS = 10_000;

export function timeoutFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  // Respect a caller-supplied signal, but still enforce our own ceiling.
  const signals: AbortSignal[] = [AbortSignal.timeout(REQUEST_TIMEOUT_MS)];
  if (init?.signal) signals.push(init.signal);

  const signal =
    signals.length === 1 ? signals[0] : AbortSignal.any(signals);

  return fetch(input, { ...init, signal });
}
