"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { CORE_BASE } from "@/lib/config";

// weekday order Mon–Sun
const weekOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// placeholder icons
const PLACEHOLDER_QUESTION = "/dashboard/question.png";
const PLACEHOLDER_DASH = "/dashboard/dash.png";

type JournalEntry = {
  mood: string;
  created_at: string;
};

const ThisWeek = () => {
  const [weekMoods, setWeekMoods] = useState<Record<string, string | null>>({});


  const fetchMoods = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${CORE_BASE}/journal/`, {
        method: "GET",
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Failed ${res.status}`);
      const data: JournalEntry[] = await res.json();

      // --- figure out start of current ISO week (Mon 00:00 local)
      const now = new Date();
      const jsDay = now.getDay();           // 0=Sun
      const daysSinceMonday = jsDay === 0 ? 6 : jsDay - 1;
      const mondayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - daysSinceMonday,
        0, 0, 0, 0
      );

      const mapped: Record<string, { mood: string; time: number }> = {};

      data
        .filter(e => new Date(e.created_at) >= mondayStart)
        .forEach((entry) => {
          const d = new Date(entry.created_at);
          const wd = weekOrder[d.getDay() === 0 ? 6 : d.getDay() - 1];
          const ts = d.getTime();

          if (!mapped[wd] || ts > mapped[wd].time) {
            mapped[wd] = { mood: entry.mood, time: ts };
          }
        });

      const final: Record<string, string> = {};
      for (const [day, val] of Object.entries(mapped)) {
        final[day] = val.mood;
      }
      setWeekMoods(final);

    } catch (err) {
      console.error("fetch mood error", err);
    }
  }, []);

  useEffect(() => {
    fetchMoods();
  }, [fetchMoods]);

  // Refresh weekly moods after a mood/journal is logged
  useEffect(() => {
    const handler = () => fetchMoods();
    window.addEventListener("journal:updated", handler);
    return () => window.removeEventListener("journal:updated", handler);
  }, [fetchMoods]);


  // figure out what weekday "today" is
  const todayIdx = (() => {
    const jsDay = new Date().getDay(); // 0-6
    return jsDay === 0 ? 6 : jsDay - 1; // align to weekOrder
  })();

  return (
    <main className="pt-5 space-y-3">
      <p className="text-[18px] md:text-[24px] font-bold">This Week&apos;s Journey</p>
      <section
        className="
    w-full 
    flex flex-row 
    gap-3 
    overflow-x-auto 
    scrollbar-thin scrollbar-thumb-gray-400
  "
      >
        {weekOrder.map((day, idx) => {
          let logo: string;
          let alt: string;

          if (weekMoods[day]) {
            logo = `/emotions/${weekMoods[day]}.png`;
            alt = weekMoods[day]!;
          } else if (idx === todayIdx) {
            logo = PLACEHOLDER_QUESTION;
            alt = "unknown";
          } else if (idx > todayIdx) {
            logo = PLACEHOLDER_DASH;
            alt = "future";
          } else {
            logo = PLACEHOLDER_DASH;
            alt = "missing";
          }

          const isQuestion = logo === PLACEHOLDER_QUESTION;
          const isDash = logo === PLACEHOLDER_DASH;

          return (
            <div
              key={day}
              className={`flex-none flex flex-col ${isQuestion ? "gap-4" : isDash ? "gap-8" : "gap-0"
                } items-center justify-center text-center text-[16px] bg-[#F5F5F5] font-semibold rounded-2xl p-4 min-w-[90px]`}
            >
              <p className="text-[24px] font-medium">{day}</p>
              <Image src={logo} width={logo === PLACEHOLDER_QUESTION || logo === PLACEHOLDER_DASH ? 20 : 50} height={logo === PLACEHOLDER_QUESTION || logo === PLACEHOLDER_DASH ? 20 : 50} alt={alt} />
            </div>
          );
        })}
      </section>

    </main>
  );
};

export default ThisWeek;







