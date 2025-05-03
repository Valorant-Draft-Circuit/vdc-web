"use client";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/16/solid";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
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

export function DropDown({ title, links }: DropDownProps) {
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
          className={`absolute -left-3 w-48 py-2 rounded-lg bg-stone-950 shadow-xl z-10 transition-all ease-in-out duration-200 ${
            open ? "opacity-100" : "opacity-0 invisible"
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

export function VerticalDropDown({
  title,
  links,
  icon,
}: {
  title: string;
  links: { name: string; href: string }[];
  icon: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = links.some((link) => pathname === link.href);

  return (
    <div className="text-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 w-48 p-2 hover:bg-vdcGrey rounded-lg transition hover:cursor-pointer ${
          isActive ? "text-vdcRed" : "hover:text-vdcRed"
        }`}
      >
        <ChevronRightIcon
          className={`w-5 h-5 transition-transform  ${open ? "rotate-90" : ""}`}
        />
        <div className="flex items-center gap-3">
          <div className="w-5">{icon}</div>
          <h1 className="italic text-lg">{title}</h1>
        </div>
      </button>
      <ul
        className={`pl-10 pr-3 mt-1 space-y-1 text-sm transition-all duration-300 ${
          open ? "opacity-100 max-h-96" : "opacity-0 max-h-0 overflow-hidden"
        }`}
      >
        {links.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className={`block py-1 hover:text-vdcRed hover:bg-vdcGrey rounded-lg p-2 ${
                pathname === link.href ? "text-vdcRed" : ""
              }`}
            >
              <h1 className="italic">{link.name}</h1>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
