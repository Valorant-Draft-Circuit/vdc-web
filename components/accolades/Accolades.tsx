"use client";
import { FireIcon, StarIcon, TrophyIcon } from "@heroicons/react/24/solid";
import { Tier } from "@prisma/client";
import { SVGProps, useState } from "react";
type TAccolade = {
  id: number;
  userID: string;
  season: number;
  tier: Tier;
  shorthand: string;
  accolade: string;
};

export function WIN({ metadata }: { metadata: TAccolade }) {
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

export function MVP({ metadata }: { metadata: TAccolade }) {
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

export function WIN_FM({ metadata }: { metadata: TAccolade }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className="flex flex-row px-2 py-1 bg-gradient-to-br from-blue-100 to-blue-700 rounded-md text-xs text-vdcBlack gap-1">
        <MaterialSymbolsCrown className="hover:opacity-90 size-3.5 text-blue-900 m-auto drop-shadow-2xl" />
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

export function AST({ metadata }: { metadata: TAccolade }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className="flex flex-row px-2 py-1 bg-gradient-to-br from-pink-100 to-pink-400 rounded-md text-xs text-vdcBlack gap-1">
        <StarIcon className="hover:opacity-90 size-3 text-pink-600 m-auto drop-shadow-2xl" />
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

export function MaterialSymbolsCrown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M5 20v-2h14v2zm0-3.5L3.725 8.475q-.05 0-.113.013T3.5 8.5q-.625 0-1.062-.438T2 7t.438-1.062T3.5 5.5t1.063.438T5 7q0 .175-.038.325t-.087.275L8 9l3.125-4.275q-.275-.2-.45-.525t-.175-.7q0-.625.438-1.063T12 2t1.063.438T13.5 3.5q0 .375-.175.7t-.45.525L16 9l3.125-1.4q-.05-.125-.088-.275T19 7q0-.625.438-1.063T20.5 5.5t1.063.438T22 7t-.437 1.063T20.5 8.5q-.05 0-.112-.012t-.113-.013L19 16.5z"
      ></path>
    </svg>
  );
}
