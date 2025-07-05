import { MAPS, MAP_LIST_URL } from "@/lib/common/constants";
import {
  Field,
  Input,
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Select,
  Textarea,
} from "@headlessui/react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import Image from "next/image";

export function TextAreaField({ field, label }) {
  return (
    <Field>
      <Label className={"mb-1 uppercase text-vdcRed"}>
        <h1>{label.replaceAll("_", " ")}</h1>
      </Label>
      <div>
        <Textarea
          {...field}
          className={
            "w-full rounded-lg bg-gray-100 text-vdcBlack dark:bg-vdcBlack dark:text-vdcWhite px-3 py-1.5 font-semibold focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2"
          }
        ></Textarea>
      </div>
    </Field>
  );
}

export function SelectField({ field, label, options }) {
  return (
    <Field>
      <Label className={"mb-1 uppercase text-vdcRed"}>
        <h1>{label.replaceAll("_", " ")}</h1>
      </Label>
      <div>
        <Select
          className={
            "w-full uppercase rounded-lg bg-gray-100 text-vdcBlack dark:bg-vdcBlack dark:text-vdcWhite px-3 py-2 font-semibold focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2"
          }
          {...field}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option.replaceAll("_", " ").toUpperCase()}
            </option>
          ))}
        </Select>
      </div>
    </Field>
  );
}

export function InputField({ field, label }) {
  return (
    <Field>
      <Label className={"mb-1 uppercase text-vdcRed"}>
        <h1>{label.replaceAll("_", " ")}</h1>
      </Label>
      <div>
        <Input
          {...field}
          className={
            "w-full rounded-lg bg-gray-100 text-vdcBlack dark:bg-vdcBlack dark:text-vdcWhite px-3 py-1.5 font-semibold focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2"
          }
        ></Input>
      </div>
    </Field>
  );
}

export function MapPoolSelect({ field, label }) {
  const [activeMaps, setActiveMaps] = useState<string[]>(() => {
    const value = field.value;
    if (typeof value === "string") {
      return value
        .toUpperCase()
        .replace(/"/g, "")
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
    }
    if (Array.isArray(value)) {
      return value;
    }
    return [];
  });

  useEffect(() => {
    field.onChange(activeMaps);
  }, [activeMaps]);

  const mapList = Object.keys(MAPS).sort();
  return (
    <div>
      <label className="block mb-1 uppercase text-vdcRed">
        <h1>
          {label.replaceAll("_", " ")}{" "}
          <span>(currently selected: {activeMaps.length})</span>
        </h1>
      </label>

      <Listbox
        name={label}
        value={activeMaps}
        onChange={setActiveMaps}
        multiple
      >
        <ListboxButton className="flex justify-between w-full rounded-lg bg-gray-100 dark:bg-vdcBlack px-3 py-2 font-semibold uppercase text-vdcBlack dark:text-vdcWhite">
          <h1 className="text-xs my-auto">{activeMaps.join(", ")}</h1>
          <ChevronDownIcon className="w-5 h-5 ml-2" />
        </ListboxButton>

        <ListboxOptions className="mt-3 w-full rounded-lg bg-gray-100 dark:bg-vdcBlack max-h-96 overflow-auto z-10 drop-shadow-lg">
          {mapList.map((map) => (
            <ListboxOption
              key={map}
              value={map}
              className="relative cursor-pointer select-none data-focus:opacity-90"
            >
              {({ selected }) => (
                <div className="relative ">
                  <h1 className="text-sm pl-10 pr-4 py-5 text-vdcWhite">
                    {map}
                  </h1>
                  <Image
                    alt=""
                    src={MAP_LIST_URL(MAPS[map.toUpperCase()])}
                    width={5000}
                    height={5000}
                    className="absolute inset-0 -z-10 size-full object-cover brightness-50"
                  />

                  {selected && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                      <CheckIcon
                        className="size-6 text-vdcRed"
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </div>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}
