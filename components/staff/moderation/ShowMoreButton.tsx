"use client";

export default function ShowMoreButton({
  remaining,
  pageSize,
  onClick,
}: {
  remaining: number;
  pageSize: number;
  onClick: () => void;
}) {
  if (remaining <= 0) return null;

  return (
    <div className="mt-3 flex justify-center">
      <button
        onClick={onClick}
        className="rounded-md bg-slate-100 px-2 py-1.5 text-xs hover:cursor-pointer hover:opacity-80 dark:bg-vdcBlack/40"
      >
        <h2>Show {Math.min(remaining, pageSize)} more</h2>
      </button>
    </div>
  );
}
