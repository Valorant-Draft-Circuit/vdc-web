"use client";
import { Tier } from "@prisma/client";
// import Filter from "../standings/filter/Filter";
import ScheduleCard from "./ScheduleCard";
import { useEffect, useState, useRef } from "react";


export default function SchedulePanel({ tier, season }: { tier: Tier; season?: number }) {
  const [matchDays, setMatchDays] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<any>(null);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const todaysMatchDateRef = useRef<string | null>(null);




  useEffect(() => {

    const fetchSchedule = async () => {
      const res = await fetch(`/api/schedule?tier=${tier}&season=${season || ""}`);
      const data = await res.json();
      const allDays = [
        ...Object.keys(data.schedule.preSeason || {}),
        ...Object.keys(data.schedule.regularSeason || {}),
      ];
      setSchedule(data.schedule);
      setMatchDays(allDays);
    };

    fetchSchedule();
  }, [tier, season]);


  useEffect(() => {
    if (!schedule || matchDays.length === 0) return;

    const today = new Date();
    const todayMMDD = (today.getMonth() + 1) * 100 + today.getDate();
    const futureMatch = matchDays.find((day) => {
      const matchDate = new Date(day.split(" - ")[0]);
      const matchDateMMDD = (matchDate.getMonth() + 1) * 100 + matchDate.getDate();
      return matchDateMMDD >= todayMMDD;
    });

    if (futureMatch) {
      todaysMatchDateRef.current = futureMatch;
      scrollToDay(futureMatch);
    } else {
      scrollToDay(matchDays[matchDays.length - 1]);
    }
  }, [schedule, matchDays]);





  const scrollToDay = (day: string) => {
    const el = cardRefs.current[day];
    const container = scrollContainerRef.current;

    if (el && container) {
      const scrollTarget = el.offsetTop - container.offsetTop;

      container.scrollTo({
        top: scrollTarget,
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
          const isVisible = rect.bottom > containerTop && rect.top < window.innerHeight;

          if (isVisible) {
            const distance = Math.abs(rect.top - containerTop);
            visibleDays.push({ day, distanceToTop: distance });
          }
        }
      });

      if (visibleDays.length > 0) {
        const closest = visibleDays.sort((a, b) => a.distanceToTop - b.distanceToTop)[0];
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



  if (matchDays.length === 0) return;



  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-center gap-4 sticky top-0 z-20 py-2">
        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          onClick={() => {
            const idx = matchDays.indexOf(activeDay!);

            if (idx > 0) scrollToDay(matchDays[idx - 1]);
          }}
          disabled={!activeDay || matchDays.indexOf(activeDay) === 0}
        >
          {"<"}
        </button>

        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          onClick={() => {
            if (todaysMatchDateRef.current) scrollToDay(todaysMatchDateRef.current);
          }}
        >
          Today
        </button>


        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          onClick={() => {
            const idx = matchDays.indexOf(activeDay!);
            if (idx < matchDays.length - 1) scrollToDay(matchDays[idx + 1]);
          }}
          disabled={!activeDay || matchDays.indexOf(activeDay) === matchDays.length - 1}
        >
           {">"}
        </button>
      </div>



      {/*Each Match Day*/}
      <div ref={scrollContainerRef} className="h-[calc(100vh-12rem)] overflow-y-auto px-4 py-4 space-y-6 scrollbar-hidden">
        {matchDays.map((day) => {
          const seasonData = schedule.preSeason[day]
            ? schedule.preSeason
            : schedule.regularSeason;

          return (
            <div key={day} data-day={day} ref={(el) => {
              if (el) cardRefs.current[day] = el;
            }} className="w-full">
              <ScheduleCard matchDay={day} season={seasonData} />
            </div>
          );
        })}
      </div>


    </div>
  );
}