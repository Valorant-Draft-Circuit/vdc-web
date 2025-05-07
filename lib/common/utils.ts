import { Tier } from "@prisma/client";

export const isTier = (value: string): value is Tier => {
  return Object.values(Tier).includes(value as Tier);
};
