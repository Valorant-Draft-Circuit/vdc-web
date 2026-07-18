"use client";

import Image from "next/image";
import { useState } from "react";

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
};

export default function PlayerAvatar({
  name,
  image,
  fallbackColor,
  sizeClass,
  pixels,
  textClass,
  shapeClass = "rounded-full",
}: Props) {
  const [failed, setFailed] = useState(false);

  if (image && !failed) {
    return (
      <Image
        src={image}
        alt={name}
        width={pixels}
        height={pixels}
        onError={() => setFailed(true)}
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
