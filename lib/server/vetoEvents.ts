import { EventEmitter } from "events";

const VETO_EMITTER_KEY = "__vdcVetoEmitter";

type GlobalWithVetoEmitter = typeof globalThis & {
  [VETO_EMITTER_KEY]?: EventEmitter;
};

export function vetoEmitter(): EventEmitter {
  const scope = globalThis as GlobalWithVetoEmitter;
  if (!scope[VETO_EMITTER_KEY]) {
    scope[VETO_EMITTER_KEY] = new EventEmitter();
    scope[VETO_EMITTER_KEY].setMaxListeners(0);
  }
  return scope[VETO_EMITTER_KEY];
}

export function emitVetoChanged(matchID: number) {
  vetoEmitter().emit("vetoChanged", matchID);
}

export function emitVetoPreview(matchID: number, map: string | null) {
  vetoEmitter().emit("vetoPreview", matchID, map);
}
