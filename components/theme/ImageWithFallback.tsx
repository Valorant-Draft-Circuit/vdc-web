"use client";

import Image from "next/image";
import { useState } from "react";
import { isAnimatedImage } from "@/lib/common/avatar";

export const ImageWithFallback = (
  props: React.ComponentProps<typeof Image> & { fallbackSrc: string },
) => {
  const { src, fallbackSrc, alt, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);
  const skipOptimization =
    rest.unoptimized ??
    (typeof imgSrc === "string" && isAnimatedImage(imgSrc));
  return (
    <Image
      {...rest}
      alt={alt ?? ""}
      unoptimized={skipOptimization}
      src={imgSrc}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
};
