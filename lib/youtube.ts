export const CHANNEL_URL = "https://www.youtube.com/@ValorantDraftCircuit";
const CHANNEL_ID = "UCcNoS_eA8_cnBj4jmyHjlkQ";
const PLACEHOLDER_URL =
  "https://www.youtube.com/embed/dQw4w9WgXcQ?si=_m6csars22cbelza";

export async function getLatestYouTubeVideo() {
  const url = `https://www.googleapis.com/youtube/v3/search?key=${process.env.GOOGLE_API_KEY}&channelId=${CHANNEL_ID}&order=date&part=snippet&type=video&maxResults=1`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, 
    });
    const data: any = await res.json();

    if (data.items && data.items.length > 0) {
      const latestVideo = data.items[0];
      const videoId = latestVideo.id.videoId;
      const videoUrl = `https://www.youtube.com/embed/${videoId}`;

      return videoUrl;
    } else {
      console.log("No videos found. Time to Rick Roll.");
      return PLACEHOLDER_URL;
    }
  } catch (error) {
    console.error("Failed to fetch latest video:", error);
  }
}
