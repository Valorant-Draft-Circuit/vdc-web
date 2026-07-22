import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import { vetoEmitter } from "./lib/server/vetoEvents";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3000);
const app = next({ dev });
const handle = app.getRequestHandler();

const vetoRooms = new Map<number, Set<WebSocket>>();

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
  console.log(`[ws - m${matchID}] joined. (room=${room.size})`);
  broadcastRoomSize(matchID);
  socket.on("close", () => {
    room.delete(socket);
    if (room.size === 0) vetoRooms.delete(matchID);
    console.log(`[ws - m${matchID}] left (room=${room.size})`);
    broadcastRoomSize(matchID);
  });
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
    handleUpgrade(req, socket, head);
  });

  server.listen(port, () => {
    console.log(`vdc-web custom server on :${port} (dev=${dev})`);
  });
});
