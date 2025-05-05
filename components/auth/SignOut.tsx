"use client";

import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/16/solid";
import { signOutAction } from "./actions";

export default function SignOut() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="xl:bg-vdcRed rounded-sm px-4 py-1 text-sm flex flex-row gap-1 font-semibold text-gray-300 xl:text-vdcWhite shadow-xs xl:hover:bg-red-500 hover:text-vdcRed hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        <ArrowRightStartOnRectangleIcon className="m-auto w-5 xl:hidden" />
        <h1 className="italic text-lg xl:text-md 4xl:text-2xl">Sign Out</h1>
      </button>
    </form>
  );
}
