"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DropDown } from "./DropDowns";
import { auth } from "@/lib/auth";
import { navLinks, staffDropDown } from "./NavBar";

export default function NavLinks() {
  const staff = false;
  // const session = auth(); // todo: check if user is staff
  const currentPath = usePathname();

  return (
    <div className="flex flex-col text-xl sm:ml-24 space-y-1 ">
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

      <div className="hidden sm:flex space-x-10">
        {navLinks.map((navItem) => (
          <DropDown
            key={navItem.name}
            title={navItem.name}
            links={navItem.links}
          />
        ))}
        {staff ? (
          <DropDown
            key={staffDropDown.name}
            title={staffDropDown.name}
            links={staffDropDown.links}
          />
        ) : null}
      </div>
    </div>
  );
}
