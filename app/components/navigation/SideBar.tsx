"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/16/solid";
import InactivityWrapper from "../theme/InactivityWrapper";
import FlameLogo from "../theme/FlameLogo";
import { VerticalDropDown } from "./DropDowns";
import { navLinks } from "./NavLinks";
import { usePathname } from "next/navigation";

export default function SideBar() {
  const [open, setOpen] = useState(false);
  const currentPath = usePathname();

  useEffect(() => {
    document.addEventListener("click", function (event) {
      const div = document.getElementById("slider");
      const target = event.target;
      if (div && !div.contains(target as Node)) {
        setOpen(false);
      }
    });
  }, []);

  return (
    <nav className="xl:hidden shadow-2xl">
      <div className="flex top-0 fixed z-20" id="slider">
        <InactivityWrapper>
          <ArrowRightIcon
            className={`z-10 w-12 h-12 p-1 mt-10 ml-5 hover:scale-110 bg-vdcBlack text-vdcRed rounded-full cursor-pointer absolute shadow-2xl transition-transform duration-100 ${
              open && "rotate-180 translate-x-72"
            }`}
            onClick={() => setOpen(!open)}
          />
        </InactivityWrapper>
        <div
          className={`bg-vdcBlack pr-12 h-screen relative border-2 border-transparent transition-all duration-100 ${
            open ? "w-auto" : "-translate-x-full"
          }`}
        >
          <div
            className={`m-auto p-3 flex flex-col gap-3 transition-opacity ${
              open ? "visible" : "invisible"
            }`}
          >
            <div className="p-2">
              <Link href="/">
                <FlameLogo
                  color={currentPath === "/" ? "#de3845" : "#fffbf5"}
                  className="w-8"
                />
              </Link>
            </div>
            {navLinks.map((navItem, index) => (
              <VerticalDropDown
                key={index}
                title={navItem.name}
                icon={navItem.icon}
                links={navItem.links}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
