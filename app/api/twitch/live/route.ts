import { isTwitchLive } from "@/lib/queries/home/twitch";

export const dynamic = "force-dynamic";

export async function GET() {
  const live = await isTwitchLive();
  return Response.json({ live });
}
