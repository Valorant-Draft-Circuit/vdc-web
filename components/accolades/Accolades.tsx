"use client";
import { FireIcon, TrophyIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import { Tier } from "@prisma/client";
import { useState } from "react";
type Accolade = {
  id: number;
  userID: string;
  season: number;
  tier: Tier;
  shorthand: string;
  accolade: string;
};

export function WIN({ metadata }: { metadata: Accolade }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className="flex flex-row px-2 py-1 bg-gradient-to-br from-yellow-100 to-amber-400 rounded-md text-xs text-vdcBlack gap-1">
        <TrophyIcon className="hover:opacity-90 size-3 text-yellow-600 m-auto drop-shadow-2xl" />
        <h2>S{metadata.season}</h2>
      </div>

      {show && (
        <div className="absolute z-10 bottom-full w-32 h-auto mb-1 left-1/2 -translate-x-1/2 text-center bg-black text-white text-xs rounded px-2 py-1 shadow-lg">
          <h3>{metadata.accolade}</h3>
        </div>
      )}
    </div>
  );
}

export function MVP({ metadata }: { metadata: Accolade }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className="flex flex-row px-2 py-1 bg-gradient-to-br from-red-100 to-red-400 rounded-md text-xs text-vdcBlack gap-1">
        <FireIcon className="hover:opacity-90 size-3 text-red-600 m-auto drop-shadow-2xl" />
        <h2>S{metadata.season}</h2>
      </div>

      {show && (
        <div className="absolute z-10 bottom-full w-32 h-auto mb-1 left-1/2 -translate-x-1/2 text-center bg-black text-white text-xs rounded px-2 py-1 shadow-lg">
          <h3>{metadata.accolade}</h3>
        </div>
      )}
    </div>
  );
}

export function WIN_FM({ metadata }: { metadata: Accolade }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className="flex flex-row px-2 py-1 bg-gradient-to-br from-yellow-100 to-amber-400 rounded-md text-xs text-vdcBlack gap-1">
        <UserGroupIcon className="hover:opacity-90 size-3 text-yellow-600 m-auto drop-shadow-2xl" />
        <h2>S{metadata.season}</h2>
      </div>

      <div
        className={`${
          show ? "opacity-100" : "opacity-0 invisible"
        } absolute z-10 bottom-full w-32 h-auto mb-1 left-1/2 -translate-x-1/2 text-center bg-vdcBlack text-vdchite text-xs rounded px-2 py-1 shadow-lg transition-opacity duration-200`}
      >
        <h3>{metadata.accolade}</h3>
      </div>
    </div>
  );
}
