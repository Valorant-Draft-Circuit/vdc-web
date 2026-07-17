function fnv1aHash(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function pseudoRandomUnitInterval(seed: string): number {
  let state = (fnv1aHash(seed) + 0x6d2b79f5) >>> 0;
  state = Math.imul(state ^ (state >>> 15), state | 1);
  state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
  return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
}
