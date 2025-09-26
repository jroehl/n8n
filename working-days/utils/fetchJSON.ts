export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  withCache?: boolean;
  cacheExpirationMinutes?: number;
}

// Simple in-memory cache for demonstration
const cache = new Map<string, { data: any; expires: number }>();

export async function fetchJSON<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T | null> {
  const {
    method = 'GET',
    headers = {},
    body,
    withCache = false,
    cacheExpirationMinutes = 60
  } = options;

  // Check cache if enabled
  if (withCache && method === 'GET') {
    const cacheKey = url;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as T;

    // Cache the result if enabled
    if (withCache && method === 'GET') {
      const cacheKey = url;
      const expires = Date.now() + (cacheExpirationMinutes * 60 * 1000);
      cache.set(cacheKey, { data, expires });
    }

    return data;
  } catch (error) {
    console.error('fetchJSON error:', error);
    return null;
  }
}