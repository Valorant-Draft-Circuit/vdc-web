import { Tier } from "@prisma/client";

export const isTier = (value: string): value is Tier => {
  return Object.values(Tier).includes(value as Tier);
};

export function toHexcode(color) {
  const colorHex = String(color).split("x")[1];
  return `#${colorHex}`;
}
