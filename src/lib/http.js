import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./token-store";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// De-duplicate concurrent refreshes into a single in-flight request.
let refreshing = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new ApiError(401, "No refresh token");

  const res = await fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new ApiError(401, "Refresh failed");

  const data = await res.json();
  setTokens(data);
  return data.accessToken;
}

/**
 * Fetch wrapper for the OrderHub API.
 * - prefixes VITE_API_URL
 * - attaches the bearer token (unless `auth: false`)
 * - transparently refreshes once on a 401, then retries
 * - throws ApiError with the server's message on failure
 */
export async function apiFetch(path, { method = "GET", body, auth = true, headers = {}, ...rest } = {}) {
  const send = (token) =>
    fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    });

  let res = await send(auth ? getAccessToken() : null);

  if (res.status === 401 && auth && getRefreshToken()) {
    try {
      refreshing = refreshing || refreshAccessToken();
      const newToken = await refreshing;
      res = await send(newToken);
    } catch {
      clearTokens();
      // Let the auth layer react (redirect to login).
      window.dispatchEvent(new Event("auth:logout"));
      throw new ApiError(401, "Session expired — please sign in again.");
    } finally {
      refreshing = null;
    }
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new ApiError(res.status, payload.error || res.statusText);
  }

  return res.status === 204 ? null : res.json();
}
