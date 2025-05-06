import { Times } from "@/lib/common/times";

export const CHANNEL_URL = "https://www.youtube.com/@ValorantDraftCircuit";
const CHANNEL_ID = "UCcNoS_eA8_cnBj4jmyHjlkQ";
const PLACEHOLDER_URL =
  "https://www.youtube.com/embed/dQw4w9WgXcQ?si=_m6csars22cbelza";

interface YouTubeSearchResponse {
  items?: Array<{
    id: { videoId: string };
  }>;
}

export async function getLatestYouTubeVideo(): Promise<string> {
  const url = `https://www.googleapis.com/youtube/v3/search?key=${process.env.GOOGLE_API_KEY}&channelId=${CHANNEL_ID}&order=date&part=snippet&type=video&maxResults=1`;

  try {
    const res = await fetch(url, { next: { revalidate: Times.HOUR } });
    const data = (await res.json()) as YouTubeSearchResponse;

    if (data.items?.length) {
      const videoId = data.items[0].id.videoId;
      return `https://www.youtube.com/embed/${videoId}`;
    }

    console.log("No videos found. Time to Rick Roll.");
    return PLACEHOLDER_URL;
  } catch (error) {
    console.error("Failed to fetch latest video:", error);
    return PLACEHOLDER_URL;
  }
}
