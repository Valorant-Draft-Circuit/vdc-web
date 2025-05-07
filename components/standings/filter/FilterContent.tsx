"use client";

import { Checkbox, Label } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/16/solid";
import { useState } from "react";

export default function FilterContent(props: { filterBy: string; index: number }) {
  const [enabled, setEnabled] = useState(false);
  const id = `filter-${props.index}`;
  return (
    <div className="flex flex-row rounded-lg py-2 transition hover:bg-white/5 gap-3">
      <Checkbox
        id={id}
        name={props.filterBy}
        checked={enabled}
        onChange={setEnabled}
        className="group size-6 rounded-md bg-vdcWhite p-1 ring-1 ring-white/15 ring-inset data-hover:brightness-95 focus:not-data-focus:outline-none data-checked:bg-white data-focus:outline data-focus:outline-offset-2 data-focus:outline-white data-hover:scale-90 transition-all duration-200 ease-in-out data-hover:cursor-pointer"
      >
        <CheckIcon className="hidden size-4 fill-vdcBlack group-data-checked:block" />
      </Checkbox>
      <Label htmlFor={id}>
        <h1 className="italic">{props.filterBy}</h1>
      </Label>
    </div>
  );
}
