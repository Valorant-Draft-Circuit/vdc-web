import { isTwitchLive } from "@/lib/queries/home/twitch";
import LiveBannerBar from "./LiveBannerBar";

export default async function LiveBanner() {
  const initialLive = await isTwitchLive();
  return <LiveBannerBar initialLive={initialLive} />;
}
