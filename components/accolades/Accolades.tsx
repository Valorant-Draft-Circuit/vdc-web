"use client";
import {
  ChartBarIcon,
  CheckBadgeIcon,
  FireIcon,
  StarIcon,
  TrophyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { Tier } from "@prisma/client";
import { JSX, SVGProps, useState } from "react";
import { TIER_WINNER_GRADIENT_MAP } from "@/lib/common/constants/tiers";

type Accolade = {
  id: number;
  userID: string;
  season: number;
  tier: Tier;
  shorthand: string;
  accolade: string;
};

type AccoladeProps = {
  metadata: Accolade;
  icon: JSX.Element;
  bgColorFrom?: string;
  bgColorTo?: string;
  bgGradient?: string;
};

function Accolade({
  metadata,
  icon,
  bgColorFrom,
  bgColorTo,
  bgGradient,
}: AccoladeProps) {
  const [show, setShow] = useState(false);
  const gradientClasses =
    bgGradient ?? `bg-gradient-to-br ${bgColorFrom} ${bgColorTo}`;
  return (
    <div
      className="relative group"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div
        className={`flex flex-row px-2 py-1 ${gradientClasses} rounded-md text-xs text-vdcBlack gap-1`}
      >
        {icon}
        <h2>S{metadata.season}</h2>
      </div>
      <AccoladeDescription desc={metadata.accolade} show={show} />
    </div>
  );
}

export function WIN({ metadata }: { metadata: Accolade }) {
  return (
    <Accolade
      metadata={metadata}
      icon={
        <TrophyIcon className="hover:opacity-90 size-3 text-yellow-600 m-auto drop-shadow-2xl" />
      }
      bgColorFrom="from-yellow-100"
      bgColorTo="to-amber-400"
    />
  );
}

export function MVP({ metadata }: { metadata: Accolade }) {
  return (
    <Accolade
      metadata={metadata}
      icon={
        <FireIcon className="hover:opacity-90 size-3 text-red-600 m-auto drop-shadow-2xl" />
      }
      bgColorFrom="from-red-100"
      bgColorTo="to-red-400"
    />
  );
}

export function WIN_FM({ metadata }: { metadata: Accolade }) {
  return (
    <Accolade
      metadata={metadata}
      icon={
        <MaterialSymbolsCrown className="hover:opacity-90 size-3.5 text-blue-900 m-auto drop-shadow-2xl" />
      }
      bgColorFrom="from-blue-100"
      bgColorTo="to-blue-700"
    />
  );
}

export function AST({ metadata }: { metadata: Accolade }) {
  return (
    <Accolade
      metadata={metadata}
      icon={
        <StarIcon className="hover:opacity-90 size-3 text-pink-600 m-auto drop-shadow-2xl" />
      }
      bgColorFrom="from-pink-100"
      bgColorTo="to-pink-400"
    />
  );
}

export function PICKEM_1ST({ metadata }: { metadata: Accolade }) {
  return (
    <Accolade
      metadata={metadata}
      icon={
        <ChartBarIcon className="hover:opacity-90 size-3 text-yellow-900 m-auto drop-shadow-2xl" />
      }
      bgGradient="bg-gradient-to-br from-yellow-100 via-amber-400 to-yellow-600"
    />
  );
}

export function PICKEM_2ND({ metadata }: { metadata: Accolade }) {
  return (
    <Accolade
      metadata={metadata}
      icon={
        <ChartBarIcon className="hover:opacity-90 size-3 text-slate-700 m-auto drop-shadow-2xl" />
      }
      bgGradient="bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500"
    />
  );
}

export function PICKEM_3RD({ metadata }: { metadata: Accolade }) {
  return (
    <Accolade
      metadata={metadata}
      icon={
        <ChartBarIcon className="hover:opacity-90 size-3 text-amber-950 m-auto drop-shadow-2xl" />
      }
      bgGradient="bg-gradient-to-br from-orange-200 via-amber-600 to-amber-800"
    />
  );
}

export function PICKEM_TIER_1ST({ metadata }: { metadata: Accolade }) {
  return (
    <Accolade
      metadata={metadata}
      icon={
        <CheckBadgeIcon className="hover:opacity-90 size-3 text-yellow-900 m-auto drop-shadow-2xl" />
      }
      bgGradient={TIER_WINNER_GRADIENT_MAP[metadata.tier]}
    />
  );
}

export function PICKEM_TOP_GROUP({ metadata }: { metadata: Accolade }) {
  return (
    <Accolade
      metadata={metadata}
      icon={
        <UserGroupIcon className="hover:opacity-90 size-3 text-purple-600 m-auto drop-shadow-2xl" />
      }
      bgColorFrom="from-purple-100"
      bgColorTo="to-purple-500"
    />
  );
}

function MaterialSymbolsCrown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M5 20v-2h14v2zm0-3.5L3.725 8.475q-.05 0-.113.013T3.5 8.5q-.625 0-1.062-.438T2 7t.438-1.062T3.5 5.5t1.063.438T5 7q0 .175-.038.325t-.087.275L8 9l3.125-4.275q-.275-.2-.45-.525t-.175-.7q0-.625.438-1.063T12 2t1.063.438T13.5 3.5q0 .375-.175.7t-.45.525L16 9l3.125-1.4q-.05-.125-.088-.275T19 7q0-.625.438-1.063T20.5 5.5t1.063.438T22 7t-.437 1.063T20.5 8.5q-.05 0-.112-.012t-.113-.013L19 16.5z"
      ></path>
    </svg>
  );
}

function AccoladeDescription({
  desc,
  show,
}: {
  desc: string;
  show: boolean;
}) {
  return (
    <>
      {show && (
        <div className="absolute z-10 bottom-full w-32 h-auto mb-1 left-1/2 -translate-x-1/2 text-center bg-black text-white text-xs rounded px-2 py-1 shadow-lg">
          <p>{desc}</p>
        </div>
      )}
    </>
  );
}
