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
 * Create a new Debezium connector.
 */
export async function createConnector(
  host: string,
  type: string,
  config: Record<string, unknown>,
  timeout = 8000
): Promise<void> {
  if (!host) throw new Error('No host specified');

  // Load base configuration for the selected connector type
  let baseConfig: Record<string, unknown> = {};
  try {
    const module = await import(`../templates/${type.toLowerCase()}.json`);
    baseConfig = module.default;
  } catch (e) {
    console.error(`Base config for ${type} not found`, e);
  }

  // Merge base config with user-provided settings
  const mergedConfig: Record<string, unknown> = { ...baseConfig, ...config };
  const connectorName = (mergedConfig.name as string) || (config.name as string);
  if (!connectorName) throw new Error('Connector name is required');

  // Remove name from config and set default server name if blank
  delete mergedConfig.name;
  if (mergedConfig['database.server.name'] === '') {
    mergedConfig['database.server.name'] = connectorName;
  }

  const payload = { name: connectorName, config: mergedConfig };
  const res = await fetchWithTimeout(
    `${host}/connectors`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    timeout
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to create connector (status ${res.status})`);
  }
}
