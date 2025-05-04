"use client";

import { signInAction } from "./actions";
import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/16/solid";

export default function SignIn() {
  return (
    <form action={signInAction} method="POST">
      <button
        type="submit"
        className="flex flex-row space-x-2 xl:bg-vdcRed rounded-sm px-4 py-1 gap-4 text-sm font-semibold text-gray-300 xl:text-vdcWhite shadow-xs hover:text-vdcRed xl:hover:bg-red-500 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        <ArrowRightEndOnRectangleIcon className="m-auto w-5 xl:hidden" />
        <h1 className="italic text-lg xl:text-md 4xl:text-2xl">Sign In</h1>
      </button>
    </form>
  );
}
