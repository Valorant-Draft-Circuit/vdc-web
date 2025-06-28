"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HomeLink() {
  const currentPath = usePathname();
  return (
    <div className="text-white italic">
      <Link
        href="/"
        className={
          currentPath === "/"
            ? "text-vdcRed"
            : "text-vdcWhite hover:text-vdcRed"
        }
      >
        <h1 className="4xl:text-3xl">VALORANT DRAFT CIRCUIT</h1>
      </Link>
    </div>
  );
}
