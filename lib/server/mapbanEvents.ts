import { EventEmitter } from "events";

const MAPBAN_EMITTER_KEY = "__vdcMapbanEmitter";

type GlobalWithMapbanEmitter = typeof globalThis & {
  [MAPBAN_EMITTER_KEY]?: EventEmitter;
};

export function mapbanEmitter(): EventEmitter {
  const scope = globalThis as GlobalWithMapbanEmitter;
  if (!scope[MAPBAN_EMITTER_KEY]) {
    scope[MAPBAN_EMITTER_KEY] = new EventEmitter();
    scope[MAPBAN_EMITTER_KEY].setMaxListeners(0);
  }
  return scope[MAPBAN_EMITTER_KEY];
}

export function emitMapbanChanged(lobbyId: string) {
  mapbanEmitter().emit("mapbanChanged", lobbyId);
}

export function emitMapbanPreview(lobbyId: string, map: string | null) {
  mapbanEmitter().emit("mapbanPreview", lobbyId, map);
}
