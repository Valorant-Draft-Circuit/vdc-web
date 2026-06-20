"use client";
import { FireIcon, StarIcon, TrophyIcon } from "@heroicons/react/24/solid";
import { Tier } from "@prisma/client";
import { JSX, SVGProps, useState } from "react";

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
  bgColorFrom: string;
  bgColorTo: string;
};

function Accolade({ metadata, icon, bgColorFrom, bgColorTo }: AccoladeProps) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative group"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div
        className={`flex flex-row px-2 py-1 bg-gradient-to-br ${bgColorFrom} ${bgColorTo} rounded-md text-xs text-vdcBlack gap-1`}
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
          <h3>{desc}</h3>
        </div>
      )}
    </>
  );
}
