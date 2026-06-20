"use client";

import { useState } from "react";
import Image from "next/image";
import { TEAM_LOGOS_URL } from "@/lib/common/constants/urls";

type Props = {
  logo: string | null;
  slug: string;
  name?: string;
  size?: string;
};

export default function TeamMark({ logo, slug, name, size = "size-7" }: Props) {
  const [failed, setFailed] = useState(false);

  if (logo && !failed) {
    return (
      <span className={`relative ${size} flex-none`}>
        <Image
          src={`${TEAM_LOGOS_URL}${logo}`}
          alt={name ?? slug}
          fill
          onError={() => setFailed(true)}
          className="object-contain"
        />
      </span>
    );
  }

  return (
    <p className="text-xs font-bold uppercase tracking-wide text-vdcGrey dark:text-gray-400">
      {slug}
    </p>
  );
}
