export type DeviceCodeResponse = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
};

export type DeviceTokenResponse =
  | { access_token: string; token_type: string; scope: string }
  | { error: "authorization_pending" | "slow_down" | "expired_token" | "access_denied" | string };

const TOKEN_STORAGE_KEY = "mm_github_access_token_v1";

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function toFormBody(obj: Record<string, string>) {
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

async function postForm<T>(url: string, body: Record<string, string>): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: toFormBody(body),
  });
  const json = (await res.json().catch(() => ({}))) as T;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return json;
}

function defaultProxyBase() {
  // CORS nedeniyle GitHub device-flow endpointleri tarayıcıdan direkt çağrıda çoğu zaman engellenir.
  // Proxy (örn. Cloudflare Worker) kullanımı için VITE_GITHUB_OAUTH_PROXY ayarlanabilir.
  const env = (import.meta as any).env || {};
  const fromEnv = (env.VITE_GITHUB_OAUTH_PROXY as string | undefined) || "";
  const fromConfig =
    (typeof window !== "undefined" && (window as any).__MM_CONFIG__?.githubOAuthProxy) || "";
  return fromEnv || fromConfig || "";
}

function withProxy(url: string) {
  const base = defaultProxyBase();
  if (!base) return url;
  // Proxy, hedef URL’yi query param ile alır: /proxy?url=https://github.com/...
  return `${base.replace(/\/$/, "")}?url=${encodeURIComponent(url)}`;
}

export async function requestDeviceCode(clientId: string, scope: string) {
  const url = withProxy("https://github.com/login/device/code");
  return await postForm<DeviceCodeResponse>(url, { client_id: clientId, scope });
}

export async function pollForToken(clientId: string, deviceCode: string) {
  const url = withProxy("https://github.com/login/oauth/access_token");
  return await postForm<DeviceTokenResponse>(url, {
    client_id: clientId,
    device_code: deviceCode,
    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
  });
}

