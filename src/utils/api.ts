// src/utils/api.ts
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 5000,
  controller?: AbortController
): Promise<Response> {
  const abortCtrl = controller || new AbortController();
  const id = setTimeout(() => abortCtrl.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: abortCtrl.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    // Retry once after a brief delay
    await new Promise(res => setTimeout(res, 1000));
    const retryResponse = await fetch(url, { ...options, signal: abortCtrl.signal });
    return retryResponse;
  }
}
