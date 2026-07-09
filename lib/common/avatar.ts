import {
  VDC_BLUE,
  VDC_GREEN,
  VDC_ORANGE,
  VDC_PURPLE,
  VDC_RED,
  VDC_YELLOW,
} from "./constants/colors";

const AVATAR_PALETTE = [
  VDC_PURPLE,
  VDC_BLUE,
  VDC_GREEN,
  VDC_YELLOW,
  VDC_ORANGE,
  VDC_RED,
];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}
