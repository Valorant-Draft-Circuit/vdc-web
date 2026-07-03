const SLOTS = Array.from({ length: 8 }, (_, index) => index);
const PILLS = Array.from({ length: 14 }, (_, index) => index);

export default function AdvancePickerSkeleton({ accent }: { accent: string }) {
  return (
    <div className="flex animate-pulse flex-col gap-3">
      <div className="h-4 w-2/3 rounded bg-gray-300/50 dark:bg-gray-600/50" />

      <div
        className="rounded-2xl border p-3"
        style={{ borderColor: accent, backgroundColor: `${accent}1a` }}
      >
        <div className="mb-2 flex justify-between">
          <div className="h-3 w-24 rounded bg-gray-300/60 dark:bg-gray-600/60" />
          <div className="h-3 w-16 rounded bg-gray-300/60 dark:bg-gray-600/60" />
        </div>
        <div
          className="grid justify-center gap-3"
          style={{ gridTemplateColumns: "repeat(4, minmax(0, 12rem))" }}
        >
          {SLOTS.map((slot) => (
            <div
              key={slot}
              className="aspect-square rounded-lg border-[1.5px] border-dashed border-black/20 dark:border-white/20"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PILLS.map((pill) => (
          <div
            key={pill}
            className="h-9 w-28 rounded-full bg-gray-300/50 dark:bg-gray-600/50"
          />
        ))}
      </div>
    </div>
  );
}
