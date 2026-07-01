"use client";

import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 rounded-2xl bg-vdcBlack px-6 py-20 text-center text-vdcWhite">
      <h1 className="text-6xl font-extrabold text-vdcRed">500</h1>
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="max-w-md text-sm text-gray-400">
        An unexpected error occurred on our end. Try again, or head back home.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-vdcRed px-5 py-2.5 text-sm font-bold text-white transition-colors hover:cursor-pointer hover:bg-red-700"
        >
          <h1>Try again</h1>
        </button>
        <Link
          href="/"
          className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-bold text-vdcWhite transition-colors hover:cursor-pointer hover:bg-white/10"
        >
          <h1>Go home</h1>
        </Link>
      </div>
      {error.digest && (
        <p className="mt-2 text-xs text-gray-500">Ref: {error.digest}</p>
      )}
    </div>
  );
}
