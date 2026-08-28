/**
 * Browser WebSocket client for the tui_gateway JSON-RPC protocol.
 *
 * Speaks the exact same newline-delimited JSON-RPC dialect that the Ink TUI
 * drives over stdio. The server-side transport abstraction
 * (tui_gateway/transport.py + ws.py) routes the same dispatcher's writes
 * onto either stdout or a WebSocket depending on how the client connected.
 *
 *   const gw = new GatewayClient()
 *   await gw.connect()
 *   const { session_id } = await gw.request<{ session_id: string }>("session.create")
 *   gw.on("message.delta", (ev) => console.log(ev.payload?.text))
 *   await gw.request("prompt.submit", { session_id, text: "hi" })
 */

import {
  JsonRpcGatewayClient,
  buildPoorMadWebSocketUrl,
  type ConnectionState,
  type GatewayEvent,
  type GatewayEventName,
} from "@poormad/shared";

import { POORMAD_BASE_PATH, buildWsAuthParam } from "@/lib/api";
import { maybeReloadForLoopbackWsAuthFailure } from "@/lib/dashboard-auth-reload";
import { readGatewayWsUrl, readGatewayToken, saveGatewayToken } from "@/lib/gatewayConfig";

export type { ConnectionState, GatewayEvent, GatewayEventName };

export class GatewayClient extends JsonRpcGatewayClient {
  constructor() {
    super({
      closedErrorMessage: "WebSocket closed",
      connectErrorMessage: "WebSocket connection failed",
      notConnectedErrorMessage: "gateway not connected",
      onSocketClose: (event) => maybeReloadForLoopbackWsAuthFailure(event.code),
      requestIdPrefix: "w",
    });
  }

  async connect(token?: string): Promise<void> {
    if (this.connectionState === "open" || this.connectionState === "connecting") {
      return;
    }

    // Static-deploy mode: the portal is served without the Python dashboard
    // server, so resolve the gateway WS URL + token from the page/config
    // instead of the dashboard-injected ticket flow.
    const wsUrl = readGatewayWsUrl();
    const effectiveToken = token ?? readGatewayToken();
    if (effectiveToken) saveGatewayToken(effectiveToken);

    if (wsUrl !== "/api/ws") {
      // Remote gateway: build the URL directly with the configured token.
      const url = new URL(wsUrl);
      if (effectiveToken) {
        url.searchParams.set("token", effectiveToken);
      }
      await super.connect(url.toString());
      return;
    }

    // Loopback mode (served by the dashboard server): use the injected token /
    // single-use ticket as before.
    const authParam = token ? (["token", token] as const) : await buildWsAuthParam();
    if (!authParam[1]) {
      throw new Error(
        "Session token not available — page must be served by the PoorMad dashboard server",
      );
    }

    await super.connect(
      buildPoorMadWebSocketUrl({
        authParam,
        basePath: POORMAD_BASE_PATH,
        path: "/api/ws",
      }),
    );
  }
}
