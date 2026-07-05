import { Fragment } from "react";
import { Round } from "@/lib/common/bracket";

export default function BracketConnectors({
  prevRound,
  nextRound,
}: {
  prevRound: Round;
  nextRound: Round;
}) {
  const prevCount = prevRound.slots.length;
  const nextCount = nextRound.slots.length;
  return (
    <div className="flex-1 min-w-[2.5rem] flex flex-col">
      <div className="h-8" />
      <div className="relative flex-1">
        {nextRound.feeders.map((feed, slotIndex) => {
          if (!feed) {
            return null;
          }
          const yTop = ((feed[0] + 0.5) / prevCount) * 100;
          const yBottom = ((feed[1] + 0.5) / prevCount) * 100;
          const yOut = ((slotIndex + 0.5) / nextCount) * 100;
          return (
            <Fragment key={slotIndex}>
              <div
                className="bk-line"
                style={{ left: 0, width: "50%", top: `${yTop}%`, height: 2 }}
              />
              <div
                className="bk-line"
                style={{ left: 0, width: "50%", top: `${yBottom}%`, height: 2 }}
              />
              <div
                className="bk-line"
                style={{
                  left: "50%",
                  top: `${yTop}%`,
                  height: `${yBottom - yTop}%`,
                  width: 2,
                }}
              />
              <div
                className="bk-line"
                style={{ left: "50%", width: "50%", top: `${yOut}%`, height: 2 }}
              />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
