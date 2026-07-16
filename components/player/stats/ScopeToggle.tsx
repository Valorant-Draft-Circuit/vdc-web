"use client";

export type Scope = "season" | "career";

const SCOPE_OPTIONS: Scope[] = ["season", "career"];

export default function ScopeToggle({
  scope,
  onChange,
}: {
  scope: Scope;
  onChange: (scope: Scope) => void;
}) {
  return (
    <div className="flex flex-row rounded-full border border-vdcBlack/30 dark:border-vdcWhite/30 bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm overflow-hidden text-xs">
      {SCOPE_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`px-3 py-1 capitalize cursor-pointer ${
            scope === option
              ? "bg-vdcRed text-vdcWhite hover:brightness-90"
              : "text-gray-500 dark:text-gray-400 hover:bg-vdcBlack/5 dark:hover:bg-vdcWhite/10 hover:text-vdcBlack dark:hover:text-vdcWhite"
          }`}
        >
          <h1>{option}</h1>
        </button>
      ))}
    </div>
  );
}
