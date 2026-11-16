import { createServer, IncomingMessage } from "http";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import { vetoEmitter } from "./lib/server/vetoEvents";
import { mapbanEmitter } from "./lib/server/mapbanEvents";
import {
  mapbanLobbies,
  shouldEvict,
  touchLobby,
} from "./lib/server/mapbanLobbies";
import { MAPBAN_LOBBY_SWEEP_INTERVAL_MS } from "./lib/common/mapbanLobbyConfig";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3000);

// `next start` sets this itself; a custom server has to. Without it, Next's
// requests to itself copy the proxy's forwarded protocol and attempt TLS
// against this plain-HTTP port.
process.env.__NEXT_PRIVATE_ORIGIN ??= `http://localhost:${port}`;

const app = next({ dev });
const handle = app.getRequestHandler();

const vetoRooms = new Map<number, Set<WebSocket>>();
const mapbanRooms = new Map<string, Set<WebSocket>>();

const HEARTBEAT_INTERVAL_MS = 30 * 1000;
const livingSockets = new WeakSet<WebSocket>();

const MAX_SOCKETS_TOTAL = 5000;
const MAX_SOCKETS_PER_IP = 30;
const MAX_INBOUND_PAYLOAD_BYTES = 1024;
const socketsByIp = new Map<string, number>();
let socketCount = 0;

function clientIp(req: IncomingMessage): string {
  const header = (name: string) => {
    const value = req.headers[name];
    return Array.isArray(value) ? value[0] : value;
  };
  return (
    header("cf-connecting-ip") ??
    header("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.socket.remoteAddress ??
    "unknown"
  );
}

/** Browsers always send Origin on a WebSocket handshake; it must be this site. */
function isSameOrigin(req: IncomingMessage): boolean {
  const origin = req.headers.origin;
  if (!origin) return false;

  // Behind a proxy the Host header may be rewritten, so accept the forwarded
  // host and the configured site URL as well.
  const allowedHosts = new Set<string>();
  const forwardedHost = req.headers["x-forwarded-host"];
  for (const host of [req.headers.host, forwardedHost].flat()) {
    if (host) allowedHosts.add(host);
  }
  try {
    if (process.env.AUTH_URL) {
      allowedHosts.add(new URL(process.env.AUTH_URL).host);
    }
    return allowedHosts.has(new URL(origin).host);
  } catch {
    return false;
  }
}

function tryReserveSocket(ip: string): boolean {
  const forIp = socketsByIp.get(ip) ?? 0;
  if (socketCount >= MAX_SOCKETS_TOTAL || forIp >= MAX_SOCKETS_PER_IP) {
    return false;
  }
  socketsByIp.set(ip, forIp + 1);
  socketCount += 1;
  return true;
}

function releaseSocket(ip: string) {
  const forIp = (socketsByIp.get(ip) ?? 1) - 1;
  if (forIp <= 0) socketsByIp.delete(ip);
  else socketsByIp.set(ip, forIp);
  socketCount = Math.max(0, socketCount - 1);
}

/** Clients only listen; anything they send is a protocol violation. */
function trackSocket(socket: WebSocket, ip: string) {
  socket.on("message", () => socket.close(1008));
  socket.on("close", () => releaseSocket(ip));
}

function startHeartbeat() {
  setInterval(() => {
    for (const [matchID, room] of vetoRooms) {
      for (const socket of room) {
        if (!livingSockets.has(socket)) {
          console.log(`[ws - m${matchID}] terminating unresponsive socket`);
          socket.terminate();
          continue;
        }
        livingSockets.delete(socket);
        socket.ping();
      }
    }
    for (const [lobbyId, room] of mapbanRooms) {
      for (const socket of room) {
        if (!livingSockets.has(socket)) {
          console.log(`[ws - lobby ${lobbyId}] terminating unresponsive socket`);
          socket.terminate();
          continue;
        }
        livingSockets.delete(socket);
        socket.ping();
      }
    }
  }, HEARTBEAT_INTERVAL_MS).unref();
}

function broadcastRoomSize(matchID: number) {
  const room = vetoRooms.get(matchID);
  if (!room) return;
  for (const socket of room) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(`viewers:${room.size}`);
    }
  }
}

function joinRoom(matchID: number, socket: WebSocket) {
  const room = vetoRooms.get(matchID) ?? new Set<WebSocket>();
  room.add(socket);
  vetoRooms.set(matchID, room);
  livingSockets.add(socket);
  socket.on("pong", () => livingSockets.add(socket));
  console.log(`[ws - m${matchID}] joined. (room=${room.size})`);
  broadcastRoomSize(matchID);
  socket.on("close", () => {
    room.delete(socket);
    if (room.size === 0) vetoRooms.delete(matchID);
    console.log(`[ws - m${matchID}] left (room=${room.size})`);
    broadcastRoomSize(matchID);
  });
}

function broadcastMapbanRoomSize(lobbyId: string) {
  const room = mapbanRooms.get(lobbyId);
  if (!room) return;
  for (const socket of room) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(`viewers:${room.size}`);
    }
  }
}

function joinMapbanRoom(lobbyId: string, socket: WebSocket) {
  const room = mapbanRooms.get(lobbyId) ?? new Set<WebSocket>();
  room.add(socket);
  mapbanRooms.set(lobbyId, room);
  livingSockets.add(socket);
  touchLobby(lobbyId);
  socket.on("pong", () => livingSockets.add(socket));
  console.log(`[ws - lobby ${lobbyId}] joined. (room=${room.size})`);
  broadcastMapbanRoomSize(lobbyId);
  socket.on("close", () => {
    room.delete(socket);
    if (room.size === 0) mapbanRooms.delete(lobbyId);
    console.log(`[ws - lobby ${lobbyId}] left (room=${room.size})`);
    broadcastMapbanRoomSize(lobbyId);
  });
}

function startLobbySweeper() {
  setInterval(() => {
    const now = Date.now();
    for (const [lobbyId, lobby] of mapbanLobbies()) {
      const room = mapbanRooms.get(lobbyId);
      const hasSockets = !!room && room.size > 0;
      if (!shouldEvict(lobby, now, hasSockets)) continue;
      if (room) {
        for (const socket of room) {
          if (socket.readyState === WebSocket.OPEN) socket.close();
        }
        mapbanRooms.delete(lobbyId);
      }
      mapbanLobbies().delete(lobbyId);
      console.log(`[ws - lobby ${lobbyId}] evicted`);
    }
  }, MAPBAN_LOBBY_SWEEP_INTERVAL_MS).unref();
}

process.on("unhandledRejection", (reason) => {
  console.error("[server] unhandledRejection", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[server] uncaughtException", error);
});

app.prepare().then(() => {
  const handleUpgrade = app.getUpgradeHandler();
  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: MAX_INBOUND_PAYLOAD_BYTES,
  });

  vetoEmitter().on("vetoChanged", (matchID: number) => {
    const room = vetoRooms.get(matchID);
    if (!room) return;
    let notified = 0;
    for (const socket of room) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send("changed");
        notified += 1;
      }
    }
    console.log(`[ws - m${matchID}] vetoChanged -> ${notified} socket(s)`);
  });

  vetoEmitter().on("vetoPreview", (matchID: number, map: string | null) => {
    const room = vetoRooms.get(matchID);
    if (!room) return;
    for (const socket of room) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(`preview:${map ?? ""}`);
      }
    }
  });

  mapbanEmitter().on("mapbanChanged", (lobbyId: string) => {
    const room = mapbanRooms.get(lobbyId);
    if (!room) return;
    for (const socket of room) {
      if (socket.readyState === WebSocket.OPEN) socket.send("changed");
    }
  });

  mapbanEmitter().on("mapbanPreview", (lobbyId: string, map: string | null) => {
    const room = mapbanRooms.get(lobbyId);
    if (!room) return;
    for (const socket of room) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(`preview:${map ?? ""}`);
      }
    }
  });

  startHeartbeat();
  startLobbySweeper();

  const server = createServer((req, res) => {
    handle(req, res);
  });

  server.on("upgrade", (req, socket, head) => {
    let pathname = "";
    let query = new URLSearchParams();
    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      pathname = url.pathname;
      query = url.searchParams;
    } catch {
      socket.destroy();
      return;
    }

    if (pathname !== "/ws/veto" && pathname !== "/ws/mapbans") {
      handleUpgrade(req, socket, head);
      return;
    }

    const ip = clientIp(req);
    if (!isSameOrigin(req)) {
      socket.destroy();
      return;
    }

    if (pathname === "/ws/veto") {
      const matchID = Number(query.get("matchID"));
      if (!Number.isSafeInteger(matchID) || matchID <= 0) {
        socket.destroy();
        return;
      }
      if (!tryReserveSocket(ip)) {
        socket.destroy();
        return;
      }
      wss.handleUpgrade(req, socket, head, (ws) => {
        trackSocket(ws, ip);
        joinRoom(matchID, ws);
      });
      return;
    }

    const lobbyId = query.get("lobbyId") ?? "";
    if (!lobbyId || !mapbanLobbies().has(lobbyId)) {
      socket.destroy();
      return;
    }
    if (!tryReserveSocket(ip)) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      trackSocket(ws, ip);
      joinMapbanRoom(lobbyId, ws);
    });
  });

  server.listen(port, () => {
    console.log(`vdc-web custom server on :${port} (dev=${dev})`);
  });
});
