"use client";

import { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import { useTheme } from "next-themes";
import SunIcon from "@heroicons/react/16/solid/SunIcon";
import { MoonIcon } from "@heroicons/react/16/solid";

export default function ThemeSwitch() {
  const [dark, setDark] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(dark ? "dark" : "light");
  }, [dark, setTheme]);

  return (
    <Switch
      checked={dark}
      onChange={setDark}
      className="group relative inline-flex h-6 w-11 4xl:scale-150 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:ring-0 focus:ring-vdcWhite focus:ring-offset-2 focus:outline-hidden data-checked:bg-vdcBlack data-checked:border-vdcWhite"
    >
      <span className="sr-only">Use setting</span>
      <span className="pointer-events-none relative inline-block size-5 transform rounded-full bg-vdcWhite shadow-sm ring-0 transition duration-200 ease-in-out group-data-checked:translate-x-5">
        <span
          aria-hidden="true"
          className="absolute inset-0 flex size-full items-center justify-center transition-opacity duration-100 ease-in group-data-checked:opacity-0 group-data-checked:duration-100 group-data-checked:ease-out"
        >
          <SunIcon className="size-3" />
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 flex size-full items-center justify-center opacity-0 transition-opacity duration-100 ease-out group-data-checked:opacity-100 group-data-checked:duration-200 group-data-checked:ease-in"
        >
          <MoonIcon className="text-vdcBlack size-3" />
        </span>
      </span>
    </Switch>
  );
}
