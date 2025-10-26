"use client";

import { MAP_LIST_URL, MAPS } from "@/lib/common/constants";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Game({ game, gameNumber, delay = 0 }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimateIn(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  const updateParam = (key: string, value: string) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const mapUrl = MAP_LIST_URL(MAPS[game.map.toUpperCase()]);

  return (
    <div
      className={`relative xl:w-full transform transition-all duration-300 ease-out
        ${animateIn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}
        ${game.gameID && "hover:cursor-pointer hover:brightness-90"} ${
        params.get("game") === game.gameID &&
        "border-1 border-vdcRed rounded-lg"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
      onClick={() => updateParam("game", game.gameID)}
    >
      <Image
        alt={game.map}
        src={mapUrl}
        width={5000}
        height={5000}
        className="absolute inset-0 -z-10 size-full object-cover rounded-lg brightness-55 dark:brightness-50"
      />

      <div className="overflow-hidden">
        <div className="flex flex-row xl:flex-col italic gap-5 px-5 py-10 text-vdcWhite">
          <h1>
            Game {gameNumber + 1}: {game.map}
          </h1>
        </div>
      </div>
    </div>
  );
}
