import MatchCard from "./MatchCard";

export default function ScheduleCard(props: { matchDay }) {
  return (
    <div className="overflow-hidden rounded-lg shadow-sm bg-vdcRed py-5">
      <div className="px-4 pb-2 sm:px-6 italic text-vdcWhite text-md xl:text-xl xl:pb-0">
        <h1>{props.matchDay.date}</h1>
      </div>
      <div className="px-4 sm:p-6 flex flex-col gap-2">
        {props.matchDay.matches.map((match, md) => (
          <MatchCard key={md} match={match} />
        ))}
      </div>
    </div>
  );
}
