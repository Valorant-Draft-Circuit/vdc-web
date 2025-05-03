"use client";

import Image from "next/image";
import { signInAction } from "./actions";

export default function SignIn() {
  return (
    <form action={signInAction} method="POST">
      <button
        type="submit"
        className="flex flex-row space-x-2 bg-vdcRed rounded-sm px-4 py-2 text-sm font-semibold text-vdcWhite shadow-xs hover:bg-red-500 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        <Image
          src="/external/discord-logo.svg"
          alt="discord symbol"
          width={20}
          height={20}
          className="my-auto 4xl:w-8"
        />
        <h1 className="italic 4xl:text-2xl">Sign In</h1>
      </button>
    </form>
  );
}
