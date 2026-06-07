import { Player } from "@/prisma";

export type PlayerProfile = NonNullable<
  Awaited<ReturnType<typeof Player.getBy>>
>;
