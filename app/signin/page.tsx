"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-vdcWhite dark:bg-vdcBlack">
      <div className="bg-vdcGrey dark:bg-[#424549] shadow-lg rounded-xl py-15 px-15 text-center max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <Image alt="vdc fl" src="/vdc-flame.svg" width={90} height={40} />
        </div>
        <button
          type="button"
          onClick={() => signIn("discord", { callbackUrl: "/" })}
          className="bg-[#5865F2] hover:brightness-90 text-white font-semibold py-2 px-4 rounded-lg w-full hover:cursor-pointer mt-4"
        >
          <h1>Sign in With Discord</h1>
        </button>
      </div>
    </div>
  );
}
