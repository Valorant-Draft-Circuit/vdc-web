"use client";

import { generatePagination } from "@/lib/queries/player/player";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pages = generatePagination(currentPage, totalPages);

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-1 pt-6">
      <Link
        href={createPageURL(Math.max(currentPage - 1, 1))}
        className={clsx(
          "px-2 py-1 text-sm text-gray-500 hover:text-black",
          currentPage === 1 && "pointer-events-none opacity-30"
        )}
      >
        <ArrowLeftIcon className="h-4 w-4" />
      </Link>

      {pages.map((page, index) => {
        if (typeof page === "string") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 py-1 text-sm text-gray-400"
            >
              ...
            </span>
          );
        }

        return (
          <Link
            key={page}
            href={createPageURL(page)}
            className={clsx(
              "rounded px-3 py-1 text-sm",
              page === currentPage
                ? "bg-vdcRed text-white font-semibold"
                : "text-gray-700 hover:bg-gray-200"
            )}
          >
            {page}
          </Link>
        );
      })}

      <Link
        href={createPageURL(Math.min(currentPage + 1, totalPages))}
        className={clsx(
          "px-2 py-1 text-sm text-gray-500 hover:text-black",
          currentPage === totalPages && "pointer-events-none opacity-30"
        )}
      >
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </nav>
  );
}
