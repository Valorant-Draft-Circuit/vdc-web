"use client";

import { ArrowRightIcon } from "@heroicons/react/24/solid";
import InactivityWrapper from "../../theme/InactivityWrapper";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import FlameLogo from "../../theme/FlameLogo";
import ThemeSwitch from "../../theme/ThemeSwitch";
import { VerticalDropDown } from "../DropDowns";
import { navLinks } from "../NavBar";
import MobileAuth from "../../auth/MobileAuth";
import { SessionProvider } from "next-auth/react";

export default function SideLinks() {
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
    <>
      <InactivityWrapper>
        <ArrowRightIcon
          className={`z-10 w-12 h-12 p-1 mt-10 ml-5 hover:scale-110 bg-vdcBlack text-vdcRed rounded-full cursor-pointer absolute shadow-2xl transition-transform duration-100 ${
            open && "rotate-180 translate-x-72"
          }`}
          onClick={() => setOpen(!open)}
        />
      </InactivityWrapper>
      <div
        className={`bg-vdcBlack flex flex-col justify-between pb-10 pl-2 pr-12 h-screen relative border-2 border-transparent transition-all duration-100 ${
          open ? "w-auto" : "-translate-x-full hidden"
        }`}
      >
        <div
          className={`p-3 flex flex-col gap-3 transition-opacity ${
            open ? "visible" : "invisible"
          }`}
        >
          <div className="p-2 flex flex-row">
            <Link href="/" onClick={() => setOpen(!open)}>
              <FlameLogo
                color={currentPath === "/" ? "#de3845" : "#fffbf5"}
                className="w-10"
              />
            </Link>
          </div>
          <div className="flex flex-row gap-5 pb-2">
            <ThemeSwitch />
            <h1 className="italic text-vdcWhite dark:hidden">Light Mode!</h1>
            <h1 className="italic text-vdcWhite hidden dark:block">
              Dark Mode!
            </h1>
          </div>

          {navLinks.map((navItem, index) => (
            <VerticalDropDown
              key={index}
              title={navItem.name}
              icon={navItem.icon}
              links={navItem.links}
              onLinkClick={() => setOpen(false)}
            />
          ))}
        </div>
        <div className="mx-auto">
          <SessionProvider>
            <MobileAuth />
          </SessionProvider>
        </div>
      </div>
    </>
  );
}
