"use client";

import Image from "next/image";
import { useState } from "react";

export const ImageWithFallback = (
  props: React.ComponentProps<typeof Image> & { fallbackSrc: string },
) => {
  const { src, fallbackSrc, alt, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      {...rest}
      alt={alt ?? ""}
      src={imgSrc}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
};
