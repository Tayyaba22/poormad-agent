/**
 * Static-deploy gateway configuration.
 *
 * The dashboard normally runs behind the Python `poormad dashboard` server,
 * which injects the WS auth token + base path into index.html. When the
 * portal is deployed as a **standalone static site** (e.g. on Hostinger at
 * xingabot.com) that talks to a *remote* hosted PoorMad agent, there is no
 * Python server in the loop — so the gateway WebSocket URL and auth token are
 * resolved from the page itself:
 *
 *   1. `window.__POORMAD_GATEWAY_WS__` — explicit `wss://host:port` override.
 *   2. `?gw=wss://host:port` — query-string override (handy for deep links).
 *   3. same-origin `/api/ws` — default (loopback dashboard mode).
 *
 * Auth (loopback-style `?token=`):
 *   1. `window.__POORMAD_SESSION_TOKEN__` — injected by a reverse proxy.
 *   2. `?token=` — query-string override.
 *   3. `localStorage["poormad.gatewayToken"]` — set by the in-app login form.
 */
export function readGatewayWsUrl(): string {
  if (typeof window === "undefined") return "/api/ws";
  const explicit = (window as any).__POORMAD_GATEWAY_WS__ as string | undefined;
  if (explicit) return explicit;
  const fromQuery = new URLSearchParams(window.location.search).get("gw");
  if (fromQuery) return fromQuery;
  return "/api/ws";
}

export function readGatewayToken(): string {
  if (typeof window === "undefined") return "";
  const injected = (window as any).__POORMAD_SESSION_TOKEN__ as string | undefined;
  if (injected) return injected;
  const fromQuery = new URLSearchParams(window.location.search).get("token");
  if (fromQuery) return fromQuery;
  try {
    return localStorage.getItem("poormad.gatewayToken") ?? "";
  } catch {
    return "";
  }
}

export function saveGatewayToken(token: string): void {
  try {
    if (token) localStorage.setItem("poormad.gatewayToken", token);
    else localStorage.removeItem("poormad.gatewayToken");
  } catch {
    /* ignore */
  }
}
