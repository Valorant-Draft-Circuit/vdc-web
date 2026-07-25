"use client";

import Image from "next/image";
import { useState } from "react";
import { isAnimatedImage } from "@/lib/common/avatar";
import { fetchFreshDiscordMedia } from "@/lib/common/discordMedia";

type Props = {
  userId: string;
  banner: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
};

export default function ProfileBannerImage({
  userId,
  banner,
  fallbackSrc,
  alt,
  className,
}: Props) {
  const [src, setSrc] = useState(banner);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTried, setRefreshTried] = useState(false);

  async function handleError() {
    if (!refreshTried) {
      setRefreshTried(true);
      setRefreshing(true);
      const { banner: fresh } = await fetchFreshDiscordMedia(userId);
      setRefreshing(false);
      if (fresh && fresh !== src) {
        setSrc(fresh);
        return;
      }
    }
    setSrc(fallbackSrc);
  }

  if (refreshing) {
    return (
      <div
        className={`animate-pulse bg-black/20 dark:bg-white/10 ${className ?? ""}`}
      />
    );
  }

  return (
    <Image
      alt={alt}
      src={src}
      fill
      sizes="100vw"
      unoptimized={isAnimatedImage(src)}
      onError={handleError}
      className={className}
    />
  );
}
