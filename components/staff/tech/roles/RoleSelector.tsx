"use client";

import { useState, useMemo } from "react";
import {
  Input,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { ROLES } from "@/lib/common/constants/roles";
import { updateRolesAction } from "@/app/staff/tech/manage-roles/[vdcId]/actions";

type Role = (typeof ROLES)[number];

export default function RoleSelector({
  defaultRoles,
  vdcId,
}: {
  defaultRoles: Role[];
  vdcId: string | undefined;
}) {
  const [selectedRoles, setSelectedRoles] = useState(defaultRoles);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const filteredRoles = useMemo(() => {
    if (query === "") return ROLES;
    return ROLES.filter((r) =>
      r.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  async function handleSubmit() {
    if (!vdcId) {
      setStatus("error");
      return;
    }
    setSaving(true);
    setStatus("idle");
    const result = await updateRolesAction(
      vdcId,
      selectedRoles.map((r) => r.value.toString()),
    );
    setSaving(false);
    setStatus(result.ok ? "success" : "error");
  }
  return (
    <div className="flex flex-row justify-between gap-5">
      <Listbox
        multiple
        value={selectedRoles}
        onChange={(roles) => {
          setSelectedRoles(roles);
          setQuery("");
        }}
        by="value"
      >
        <div className="relative w-1/2 my-auto">
          <ListboxButton className="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white dark:bg-vdcGrey py-2 pl-3 pr-10 text-left shadow-sm focus:border-vdcRed focus:ring-vdcRed sm:text-sm">
            <h1 className="block truncate">
              {selectedRoles.length > 0
                ? selectedRoles.map((r) => r.label.replace("_", " ")).join(", ")
                : "Select roles..."}
            </h1>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </span>
          </ListboxButton>

          <ListboxOptions className="absolute z-20 mt-1 w-full rounded-md bg-white dark:bg-vdcGrey shadow-lg ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto text-base focus:outline-none sm:text-sm">
            <div className="sticky top-0 z-10 bg-white dark:bg-vdcGrey border-b border-gray-200 dark:border-gray-600 p-2">
              <Input
                type="text"
                placeholder="Search roles..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-md rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-vdcGrey py-1 px-2 text-sm focus:border-vdcRed focus:ring-vdcRed"
              />
            </div>

            {filteredRoles.length === 0 ? (
              <div className="px-4 py-2 text-gray-500">No roles found.</div>
            ) : (
              filteredRoles.map((role) => (
                <ListboxOption
                  key={role.value}
                  value={role}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active
                        ? "bg-vdcRed text-vdcWhite"
                        : "text-gray-900 dark:text-gray-100"
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <h1
                        className={`block truncate ${
                          selected ? "font-semibold" : "font-normal"
                        }`}
                      >
                        {role.label.replace("_", " ")}
                      </h1>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-vdcRed dark:text-white">
                          <CheckIcon className="h-5 w-5" />
                        </span>
                      ) : null}
                    </>
                  )}
                </ListboxOption>
              ))
            )}
          </ListboxOptions>
        </div>
      </Listbox>

      <div className="my-auto">
        <h1 className="mb-1">Current/Selected Roles:</h1>
        {selectedRoles.length === 0 ? (
          <h2 className="text-gray-500 text-sm">No roles selected.</h2>
        ) : (
          <ul className="list-disc ml-6 text-sm grid grid-cols-2 space-x-5 w-full">
            {selectedRoles.map((r) => (
              <li key={r.label}>
                <h2>{r.label.replace("_", " ")}</h2>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 my-auto">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-4 py-2 bg-vdcRed text-white rounded-md hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-20 hover:cursor-pointer"
        >
          <h1>{saving ? "Saving..." : "Save Changes"}</h1>
        </button>
        <div className="text-sm">
          {status === "success" && (
            <p className="text-green-600 font-medium">Roles updated!</p>
          )}
          {status === "error" && (
            <p className="text-red-600 font-medium">Error updating roles.</p>
          )}
        </div>
      </div>
    </div>
  );
}
