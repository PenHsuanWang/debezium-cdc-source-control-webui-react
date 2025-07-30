// src/utils/api.ts

/**
 * fetchWithTimeout
 * - Always uses CORS mode so browser fetch receives real response (not "opaque").
 * - Adds Accept: application/json by default.
 * - Supports timeout via AbortController.
 * - Retries once after a brief back-off if the first fetch fails.
 *
 * Usage:
 *   const res = await fetchWithTimeout('/connectors');
 */
export async function fetchWithTimeout(
  resource: RequestInfo | URL,
  options: RequestInit = {},
  timeout = 8000
): Promise<Response> {
  // Always use a new controller internally
  const doFetch = async (): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      return await fetch(resource, {
        ...options,
        mode: 'cors', // This enables CORS in browsers
        headers: {
          Accept: 'application/json',
          ...(options.headers || {}),
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    return await doFetch();
  } catch {
    // Single retry after a short delay (good for Docker Compose startup timing)
    await new Promise((r) => setTimeout(r, 750));
    return doFetch();
  }
}

/**
 * Create a new Debezium connector
 */
export async function createConnector(
  host: string,
  config: Record<string, unknown>,
  timeout = 8000
): Promise<void> {
  const res = await fetchWithTimeout(
    `${host}/connectors`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: String(config.name || ''), config })
    },
    timeout
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to create connector');
  }
}
