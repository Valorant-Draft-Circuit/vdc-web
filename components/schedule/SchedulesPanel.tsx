"use client";

import { Tier } from "@prisma/client";
// import Filter from "../standings/filter/Filter";
import ScheduleCard from "./ScheduleCard";
import { useEffect, useState, useRef } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { Schedule } from "@/lib/queries/schedule/schedule";

export default function SchedulePanel({
  tier,
  season,
}: {
  tier: Tier;
  season?: number;
}) {
  const [matchDays, setMatchDays] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<Schedule>();
  const [nearestDay, setNearestDay] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const todaysMatchDateRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      const res = await fetch(
        `/api/schedule?tier=${tier}&season=${season || ""}`,
        { next: { revalidate: 3600 } },
      );
      const data = await res.json();
      const allDays = [
        ...Object.keys(data.schedule.preSeason || {}),
        ...Object.keys(data.schedule.regularSeason || {}),
        ...Object.keys(data.schedule.bo3Season || {}),
        ...Object.keys(data.schedule.bo5Season || {}),
      ];
      setSchedule(data.schedule);
      setMatchDays(allDays);
    };

    fetchSchedule();
  }, [tier, season]);

  useEffect(() => {
    if (!schedule || matchDays.length === 0) {
      return;
    }

    const today = new Date();
    const todayMMDD = (today.getMonth() + 1) * 100 + today.getDate();

    const nearestMatch = matchDays.find((day) => {
      const matchDate = new Date(day.split("|")[1]);
      const matchDateMMDD =
        (matchDate.getMonth() + 1) * 100 + matchDate.getDate();
      return matchDateMMDD >= todayMMDD;
    });

    setNearestDay(nearestMatch ?? matchDays[matchDays.length - 1]);

    if (nearestMatch) {
      todaysMatchDateRef.current = nearestMatch;
      scrollToDay(nearestMatch);
    } else {
      scrollToDay(matchDays[matchDays.length - 1]);
    }
  }, [schedule, matchDays]);

  const scrollToDay = (day: string) => {
    const el = cardRefs.current[day];
    const container = scrollContainerRef.current;
    if (el && container) {
      container.scrollTo({
        top: el.offsetTop,
        left: 0,
        behavior: "smooth",
      });
      setActiveDay(day);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      const visibleDays: { day: string; distanceToTop: number }[] = [];

      matchDays.forEach((day) => {
        const el = cardRefs.current[day];
        if (el) {
          const rect = el.getBoundingClientRect();
          const isVisible =
            rect.bottom > containerTop && rect.top < window.innerHeight;

          if (isVisible) {
            const distance = Math.abs(rect.top - containerTop);
            visibleDays.push({ day, distanceToTop: distance });
          }
        }
      });

      if (visibleDays.length > 0) {
        const closest = visibleDays.sort(
          (a, b) => a.distanceToTop - b.distanceToTop,
        )[0];
        if (closest.day !== activeDay) {
          setActiveDay(closest.day);
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [matchDays, activeDay]);

  if (matchDays.length === 0)
    return (
      <h1 className="text-center">No scheduled matches for {tier} (yet?)</h1>
    );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col md:flex-row gap-4 sticky top-0 z-20 justify-between">
        <h1 className="text-vdcRed italic text-3xl md:text-2xl xl:text-3xl text-center my-auto">
          Season {season} Schedule
        </h1>
        <div className="flex flex-row m-auto md:m-0 gap-5">
          <PreviousDayButton
            matchDays={matchDays}
            activeDay={activeDay}
            scrollToDay={scrollToDay}
          />
          <NearestButton
            activeDay={activeDay}
            nearestDay={nearestDay}
            scrollToDay={scrollToDay}
          />
          <NextDayButton
            matchDays={matchDays}
            activeDay={activeDay}
            scrollToDay={scrollToDay}
          />
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="relative h-[calc(100vh-12rem)] overflow-y-auto space-y-5 scrollbar-hidden"
      >
        {matchDays.map((day) => {
          const seasonData = schedule?.preSeason[day]
            ? schedule.preSeason
            : {
                ...schedule?.regularSeason,
                ...schedule?.bo3Season,
                ...schedule?.bo5Season,
              };
          return (
            <div
              key={day}
              data-day={day}
              ref={(el) => {
                if (el) cardRefs.current[day] = el;
              }}
              className="w-full"
            >
              <ScheduleCard matchDay={day} season={seasonData} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PreviousDayButton({ matchDays, activeDay, scrollToDay }) {
  return (
    <button
      className="px-6 py-2 bg-gray-100 dark:bg-vdcGrey rounded border border-vdcBlack disabled:opacity-50 disabled:hover:cursor-not-allowed hover:cursor-pointer hover:opacity-90"
      onClick={() => {
        const idx = matchDays.indexOf(activeDay!);

        if (idx > 0) scrollToDay(matchDays[idx - 1]);
      }}
      disabled={!activeDay || matchDays.indexOf(activeDay) === 0}
    >
      <ArrowLeftIcon className="size-5" />
    </button>
  );
}
function NearestButton({ activeDay, nearestDay, scrollToDay }) {
  return (
    <button
      className="px-4 py-2 bg-gray-100 dark:bg-vdcGrey rounded border-1 border-vdcBlack disabled:opacity-50 disabled:hover:cursor-not-allowed hover:cursor-pointer hover:opacity-90"
      onClick={() => {
        if (nearestDay) scrollToDay(nearestDay);
      }}
      disabled={activeDay === nearestDay}
    >
      <h1>Nearest</h1>
    </button>
  );
}
function NextDayButton({ matchDays, activeDay, scrollToDay }) {
  return (
    <button
      className="px-6 py-2 bg-gray-100 dark:bg-vdcGrey rounded border-1 border-vdcBlack disabled:opacity-50 disabled:hover:cursor-not-allowed hover:cursor-pointer hover:opacity-90"
      onClick={() => {
        const idx = matchDays.indexOf(activeDay!);
        if (idx < matchDays.length - 1) scrollToDay(matchDays[idx + 1]);
      }}
      disabled={
        !activeDay || matchDays.indexOf(activeDay) === matchDays.length - 1
      }
    >
      <ArrowRightIcon className="size-5" />
    </button>
  );
}
