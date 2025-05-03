"use client";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/16/solid";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface LinkItem {
  name: string;
  href: string;
  ext?: boolean;
}

type DropDownProps = {
  title: string;
  links: LinkItem[];
};

export default function DropDown({ title, links }: DropDownProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const currentPath = usePathname();
  const isActive = links.some((link) => pathname === link.href);

  return (
    <div
      onMouseOver={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className={`${
        isActive ? "text-vdcRed" : "text-gray-200 hover:text-vdcRed"
      }`}
    >
      <div className="relative w-auto h-auto">
        <button className="flex items-center uppercase text-sm">
          <h1 className="italic 4xl:text-xl">{title}</h1>
          <ChevronDownIcon
            className={`${
              open ? "rotate-180" : ""
            } w-4 h-4 ml-1 transition-transform`}
          />
        </button>
        <ul
          className={`absolute -left-3 w-48 py-2 rounded-lg bg-stone-950 shadow-xl z-10 transition-opacity ease-in-out duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              target={link.ext ? "_blank" : ""}
              rel={link.ext ? "noreferrer" : ""}
              className={`${
                currentPath === `${link.href}` ? "text-vdcRed" : "text-gray-200"
              } px-3 py-2 flex flex-row text-gray-200 hover:text-vdcRed text-sm space-x-1`}
            >
              <h1 className="italic break-keep 4xl:text-xl">{link.name}</h1>
              {link.ext ? <ArrowTopRightOnSquareIcon className="w-4" /> : null}
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}
