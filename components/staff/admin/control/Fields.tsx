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
  Switch,
  Textarea,
} from "@headlessui/react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ControllerRenderProps } from "react-hook-form";
import { Maps } from "@/lib/common/valorant-api";
import { getMapsCached } from "@/lib/common/cache";

type FieldProps = {
  field: ControllerRenderProps;
  label: string;
};

export function SwitchField({ field, label }: FieldProps) {
  return (
    <Field>
      <Label className={"mb-2 uppercase text-vdcRed"}>
        <h1>{label.replaceAll("_", " ")}</h1>
      </Label>
      <div className="flex flex-row gap-2 text-xs">
        <h1 className="my-auto">F</h1>
        <Switch
          {...field}
          onChange={(val: boolean) => field.onChange(val)}
          className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-vdcGrey transition data-checked:bg-vdcRed data-hover:cursor-pointer"
        >
          <span className="size-4 translate-x-1 rounded-full bg-vdcWhite transition group-data-checked:translate-x-6" />
        </Switch>
        <h1 className="my-auto">T</h1>
      </div>
    </Field>
  );
}

export function TextAreaField({ field, label }: FieldProps) {
  return (
    <Field>
      <Label className={"mb-1 uppercase text-vdcRed"}>
        <h1>{label.replaceAll("_", " ")}</h1>
      </Label>
      <div>
        <Textarea
          {...field}
          className={
            "w-full rounded-lg bg-gray-100 text-vdcBlack dark:bg-vdcGrey dark:text-vdcWhite px-3 py-1.5 font-semibold focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2"
          }
        ></Textarea>
      </div>
    </Field>
  );
}

export function SelectField({
  field,
  label,
  options,
}: FieldProps & { options: string[] }) {
  return (
    <Field>
      <Label className={"mb-1 uppercase text-vdcRed"}>
        <h1>{label.replaceAll("_", " ")}</h1>
      </Label>
      <div>
        <Select
          className={
            "w-full uppercase rounded-lg bg-gray-100 text-vdcBlack dark:bg-vdcGrey dark:text-vdcWhite px-3 py-2 font-semibold focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2"
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

export function InputField({ field, label }: FieldProps) {
  return (
    <Field>
      <Label className={"mb-1 uppercase text-vdcRed"}>
        <h1>{label.replaceAll("_", " ")}</h1>
      </Label>
      <div>
        <Input
          {...field}
          className={
            "w-full rounded-lg bg-gray-100 text-vdcBlack dark:bg-vdcGrey dark:text-vdcWhite px-3 py-1.5 font-semibold focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2"
          }
        ></Input>
      </div>
    </Field>
  );
}

export function MapPoolSelect({ field, label }: FieldProps) {
  const [maps, setMaps] = useState<Maps>();
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

  useEffect(() => {
    let isMounted = true;
    async function loadMaps() {
      try {
        const data = await getMapsCached();
        if (isMounted) {
          setMaps(data);
        }
      } catch (err) {
        console.error("Failed to load maps", err);
        if (isMounted) {
          setMaps(MAPS);
        }
      }
    }
    loadMaps();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!maps) {
    return;
  }

  const mapList = Object.keys(maps).sort();
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
        <ListboxButton className="flex justify-between w-full rounded-lg bg-gray-100 dark:bg-vdcGrey px-3 py-2 font-semibold uppercase text-vdcBlack dark:text-vdcWhite">
          <h1 className="text-xs my-auto">{activeMaps.join(", ")}</h1>
          <ChevronDownIcon className="w-5 h-5 ml-2" />
        </ListboxButton>

        <ListboxOptions className="mt-3 w-full rounded-lg bg-gray-100 dark:bg-vdcGrey max-h-96 overflow-auto z-10 drop-shadow-lg">
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
                    src={MAP_LIST_URL(maps[map.toUpperCase()])}
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
