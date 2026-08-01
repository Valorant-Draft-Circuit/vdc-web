import { createServer } from "http";
import { parse } from "url";
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
const app = next({ dev });
const handle = app.getRequestHandler();

const vetoRooms = new Map<number, Set<WebSocket>>();
const mapbanRooms = new Map<string, Set<WebSocket>>();

const HEARTBEAT_INTERVAL_MS = 30 * 1000;
const livingSockets = new WeakSet<WebSocket>();

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
  const wss = new WebSocketServer({ noServer: true });

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
    handle(req, res, parse(req.url ?? "/", true));
  });

  server.on("upgrade", (req, socket, head) => {
    const { pathname, query } = parse(req.url ?? "/", true);
    if (pathname === "/ws/veto") {
      const matchID = Number(query.matchID);
      if (!Number.isInteger(matchID)) {
        console.warn(
          `[ws - m${matchID}] rejected upgrade with bad matchID: ${req.url}`,
        );
        socket.destroy();
        return;
      }
      wss.handleUpgrade(req, socket, head, (ws) => joinRoom(matchID, ws));
      return;
    }
    if (pathname === "/ws/mapbans") {
      const lobbyId = typeof query.lobbyId === "string" ? query.lobbyId : "";
      if (!lobbyId || !mapbanLobbies().has(lobbyId)) {
        console.warn(`[ws - lobby] rejected upgrade with bad lobbyId: ${req.url}`);
        socket.destroy();
        return;
      }
      wss.handleUpgrade(req, socket, head, (ws) => joinMapbanRoom(lobbyId, ws));
      return;
    }
    handleUpgrade(req, socket, head);
  });

  server.listen(port, () => {
    console.log(`vdc-web custom server on :${port} (dev=${dev})`);
  });
});
