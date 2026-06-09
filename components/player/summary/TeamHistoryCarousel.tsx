"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { Tier } from "@prisma/client";
import { TEAM_LOGOS_URL } from "@/lib/common/constants";

export type TeamHistorySlide = {
  teamId: number;
  name: string;
  tier: Tier;
  slug: string;
  logoPath: string | null;
  gamesPlayed: number;
  wins: number;
  losses: number;
};

export default function TeamHistoryCarousel({
  slides,
}: {
  slides: TeamHistorySlide[];
}) {
  const [index, setIndex] = useState(0);
  const activeSlide = slides[index];
  const hasMultiple = slides.length > 1;
  const atStart = index === 0;
  const atEnd = index === slides.length - 1;

  const goPrev = () => setIndex((current) => Math.max(0, current - 1));
  const goNext = () =>
    setIndex((current) => Math.min(slides.length - 1, current + 1));

  return (
    <div className="px-4 py-3 sm:px-6 flex flex-col gap-1.5">
      <div className="flex flex-row items-center justify-center gap-3">
        {hasMultiple && (
          <ArrowButton direction="prev" disabled={atStart} onClick={goPrev} />
        )}
        <div className="w-56 h-16 shrink-0 flex items-center">
          <TeamSlide slide={activeSlide} />
        </div>
        {hasMultiple && (
          <ArrowButton direction="next" disabled={atEnd} onClick={goNext} />
        )}
      </div>
      {hasMultiple && (
        <h2 className="text-center text-[10px] tracking-wider text-gray-500 dark:text-gray-400">
          {index + 1} / {slides.length}
        </h2>
      )}
    </div>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrev ? "Previous team" : "Next team"}
      className="shrink-0 rounded-full p-1 text-vdcBlack dark:text-vdcWhite disabled:opacity-30 enabled:cursor-pointer enabled:hover:text-vdcRed"
    >
      {isPrev ? (
        <ChevronLeftIcon className="size-5" />
      ) : (
        <ChevronRightIcon className="size-5" />
      )}
    </button>
  );
}

function TeamSlide({ slide }: { slide: TeamHistorySlide }) {
  const logoSrc = slide.logoPath
    ? `${TEAM_LOGOS_URL}${slide.logoPath}`
    : "/vdc-flame.svg";
  const franchiseHref = `/franchises/${slide.slug}?team=${slide.tier.toLowerCase()}`;

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 w-full">
      <Link href={franchiseHref} className="relative block size-10 shrink-0">
        <Image
          src={logoSrc}
          alt={slide.name}
          fill
          sizes="40px"
          className="rounded-md object-contain"
        />
      </Link>
      <div className="flex flex-col min-w-0">
        <h1 className="text-sm text-wrap">{slide.name}</h1>
        <h2 className="text-xs text-gray-500 dark:text-gray-400">
          {slide.tier}
        </h2>
      </div>
      <div className="text-lg flex flex-row items-center gap-1 tabular-nums justify-self-end">
        <h2 className="text-vdcGreen">{slide.wins}</h2>
        <h2 className="text-gray-400">-</h2>
        <h2 className="text-vdcRed">{slide.losses}</h2>
      </div>
    </div>
  );
}
