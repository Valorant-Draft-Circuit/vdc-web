import MatchCard from "./MatchCard";

export default function ScheduleCard(props: { matchDay; season }) {
  return (
    <div className="overflow-hidden rounded-lg shadow-sm bg-vdcRed p-3 px-auto">
      <div className="px-4 pb-2 sm:px-6 italic text-vdcWhite text-md xl:text-xl xl:pb-0">
        <h1>{props.matchDay}</h1>
      </div>
      <div className="px-2 sm:p-6 flex flex-col gap-2">
        {props.season[props.matchDay].map((match, md) => (
          <MatchCard key={md} match={match} />
        ))}
      </div>
    </div>
  );
}
