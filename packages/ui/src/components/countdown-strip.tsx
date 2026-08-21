"use client";

import { useRef, useSyncExternalStore, type ReactNode } from "react";

export type CountdownStripLabels = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

export type CountdownStripProps = {
  tagline: ReactNode;
  targetDate: string;
  labels?: CountdownStripLabels;
};

const DEFAULT_LABELS: CountdownStripLabels = {
  days: "Days",
  hours: "Hours",
  minutes: "Minutes",
  seconds: "Seconds",
};

type CountdownValue = { days: string; hours: string; minutes: string; seconds: string };

const SERVER_SNAPSHOT: CountdownValue = { days: "00", hours: "00", minutes: "00", seconds: "00" };

function computeCountdown(targetDate: string): CountdownValue {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  const pad = (value: number) => String(value).padStart(2, "0");
  return {
    days: String(Math.floor(diff / 86_400_000)),
    hours: pad(Math.floor((diff % 86_400_000) / 3_600_000)),
    minutes: pad(Math.floor((diff % 3_600_000) / 60_000)),
    seconds: pad(Math.floor((diff % 60_000) / 1_000)),
  };
}

function subscribe(callback: () => void) {
  const timer = setInterval(callback, 1000);
  return () => clearInterval(timer);
}

function useCountdown(targetDate: string): CountdownValue {
  const cacheRef = useRef<CountdownValue | null>(null);

  const getSnapshot = () => {
    const next = computeCountdown(targetDate);
    const cached = cacheRef.current;
    if (
      cached &&
      cached.days === next.days &&
      cached.hours === next.hours &&
      cached.minutes === next.minutes &&
      cached.seconds === next.seconds
    ) {
      return cached;
    }
    cacheRef.current = next;
    return next;
  };

  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);
}

export function CountdownStrip({
  tagline,
  targetDate,
  labels = DEFAULT_LABELS,
}: CountdownStripProps) {
  const value = useCountdown(targetDate);

  const stats: [string, string][] = [
    [value.days, labels.days],
    [value.hours, labels.hours],
    [value.minutes, labels.minutes],
    [value.seconds, labels.seconds],
  ];

  return (
    <section className="bg-primary px-6 py-14 text-center text-primary-foreground">
      <p className="mb-6 font-serif text-2xl italic">{tagline}</p>
      <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
        {stats.map(([digits, label]) => (
          <div key={label}>
            <div className="font-serif text-5xl sm:text-6xl">{digits}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.2em] opacity-85">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
