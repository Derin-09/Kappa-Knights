
'use client'
import React, { useCallback, useEffect } from 'react'
import PerformanceCard from './ui/PerformanceCard'
import { useUserStore } from '@/state/store';
import { JournalEntry } from '@/types/journal';
import { useUserProfileStore } from '@/state/user';
import { CORE_BASE } from '@/lib/config';


const Performance = () => {
     const {daysActive, setDaysActive, avgMood, setAvgMood} = useUserStore()
     const profile = useUserProfileStore((s) => s.profile)
     const [enrolledCount, setEnrolledCount] = React.useState(0)
    
      const fetchProgress = useCallback(async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;
    
          const res = await fetch(`${CORE_BASE}/journal/`,{
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store'
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
          const data: JournalEntry[] = await res.json();
          console.log("Raw sentiment scores:", data.map(d => d.sentiment_score))
    
          // count unique YYYY-MM-DD values
          const uniqueDays = new Set<string>();
          let scoreSum = 0;
    
          data.forEach((entry) => {
            const isoDay = new Date(entry.created_at).toISOString().slice(0, 10);
            uniqueDays.add(isoDay);
            scoreSum += entry.sentiment_score * 5; // scale 0–1 → 0–5
          });
    
          setDaysActive(uniqueDays.size);
          setAvgMood(data.length ? scoreSum / data.length : 0);
    
        } catch (err) {
          console.error("progress fetch error", err);
        }
      }, [setDaysActive, setAvgMood]);

      const fetchEnrollmentsCount = useCallback(async () => {
        try {
          const res = await fetch('https://nuroki-backend.onrender.com/enrollments/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
          })
          if (!res.ok) return
          const raw: unknown = await res.json()
          const pickArray = (v: unknown): unknown[] => {
            if (Array.isArray(v)) return v
            if (typeof v === 'object' && v !== null) {
              const o = v as Record<string, unknown>
              if (Array.isArray(o.results)) return o.results
              if (Array.isArray(o.courses)) return o.courses
            }
            return []
          }
          const arr = pickArray(raw) as { user?: string | number }[]
          const uid = profile?.user_id
          const count = uid == null ? arr.length : arr.filter(e => String(e.user) === String(uid)).length
          setEnrolledCount(count)
        } catch {}
      }, [profile?.user_id])
    
      useEffect(() => {
        fetchProgress();
        fetchEnrollmentsCount();
      }, [fetchProgress, fetchEnrollmentsCount]);
    
      // Refresh progress immediately after a mood/journal is logged
      useEffect(() => {
        const handler = () => fetchProgress();
        window.addEventListener("journal:updated", handler);
        return () => window.removeEventListener("journal:updated", handler);
      }, [fetchProgress]);


      
const Details = [
    {
        title: 'Skills Enrolled',
        icon: '/dashboard/insights/skillsCompleted.png',
        num: enrolledCount,
        numText: '',
        text: 'Total Unique Skills enrolled'
    },
    {
        title: 'Active Days',
        icon: '/dashboard/insights/daysActive.png',
        num: daysActive,
        numText: ( daysActive === 1 ? 'Day' : 'Days'),
        text: 'Your current longest learning streak'
    },
    {
        title: 'Hours Studied',
        icon: '/dashboard/insights/hoursStudied.png',
        num: 0,
        numText: 'Hours',
        text: 'Total time spent learning on Nuroki'
    },
    {
        title: 'Average Motivation',
        icon: '/dashboard/insights/motivation.png',
        num: Number(avgMood.toFixed(1))/5 * 100,
        numText: '%',
        text: 'Your average self-reported motivation level'
    },
]
    return (
        <section className='select-none'>
            <p className='pb-3 font-bold text-[20px] md:text-[24px]'>Overall Performance</p>
            <div className='grid grid-cols-2 gap-3 lg:flex md:w-full items-stretch'>
                {Details.map((item, idx) => (
                    <div key={idx} className='h-full'>
                    <PerformanceCard props={{
                        title: item.title,
                        icon: item.icon,
                        num: item.num,
                        numText: item.numText,
                        details: item.text
                    }} />
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Performance