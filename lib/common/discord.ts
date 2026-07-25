type DiscordAssetType = "avatar" | "banner";

export function getMediaSource(
  asset: string | null,
  assetType: DiscordAssetType,
  id: string,
): string | null {
  const assetSize = 2048;

  if (!asset) return null;
  const format = asset.startsWith("a_") ? "gif" : "webp";
  if (assetType === "avatar") {
    return `https://cdn.discordapp.com/avatars/${id}/${asset}.${format}?size=${assetSize}`;
  }
  return `https://cdn.discordapp.com/banners/${id}/${asset}.${format}?size=${assetSize}`;
}
