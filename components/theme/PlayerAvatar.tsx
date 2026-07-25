"use client";

import Image from "next/image";
import { useState } from "react";
import { isAnimatedImage } from "@/lib/common/avatar";
import { fetchFreshDiscordMedia } from "@/lib/common/discordMedia";

function initials(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return "??";
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

type Props = {
  name: string;
  image: string | null;
  fallbackColor: string;
  sizeClass: string;
  pixels: number;
  textClass: string;
  shapeClass?: string;
  userId?: string;
};

export default function PlayerAvatar({
  name,
  image,
  fallbackColor,
  sizeClass,
  pixels,
  textClass,
  shapeClass = "rounded-full",
  userId,
}: Props) {
  const [currentImage, setCurrentImage] = useState(image);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTried, setRefreshTried] = useState(false);

  async function handleError() {
    if (userId && !refreshTried) {
      setRefreshTried(true);
      setRefreshing(true);
      const { image: fresh } = await fetchFreshDiscordMedia(userId);
      setRefreshing(false);
      if (fresh && fresh !== currentImage) {
        setCurrentImage(fresh);
        return;
      }
    }
    setFailed(true);
  }

  if (refreshing) {
    return (
      <div
        className={`${sizeClass} flex-none ${shapeClass} animate-pulse`}
        style={{ backgroundColor: fallbackColor }}
      />
    );
  }

  if (currentImage && !failed) {
    return (
      <Image
        src={currentImage}
        alt={name}
        width={pixels}
        height={pixels}
        unoptimized={isAnimatedImage(currentImage)}
        onError={handleError}
        className={`${sizeClass} flex-none ${shapeClass} object-cover`}
      />
    );
  }

  return (
    <h2
      className={`flex ${sizeClass} flex-none items-center justify-center ${shapeClass} font-extrabold text-white ${textClass}`}
      style={{ backgroundColor: fallbackColor }}
    >
      {initials(name)}
    </h2>
  );
}
