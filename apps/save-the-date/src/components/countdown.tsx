"use client";

import { useSyncExternalStore } from "react";

import { WEDDING_DATE } from "./invitation-content";

const DAY_MS = 24 * 60 * 60 * 1000;

function utcMidnight(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

/** Whole calendar days from one `YYYY-MM-DD` date to another; immune to daylight saving. */
export function daysBetween(from: string, to: string) {
  return Math.round((utcMidnight(to) - utcMidnight(from)) / DAY_MS);
}

export function countdownLabel(days: number) {
  if (days < 0) return null;
  if (days === 0) return "Today’s the day!";
  return days === 1 ? "1 day to go" : `${days} days to go`;
}

function readToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** The server has no visitor's clock, so the countdown is a client-only detail. */
function readServerToday() {
  return null;
}

function subscribe() {
  return () => {};
}

type CountdownProps = {
  className: string;
};

export function Countdown({ className }: CountdownProps) {
  const today = useSyncExternalStore(subscribe, readToday, readServerToday);
  if (today === null) return null;

  const label = countdownLabel(daysBetween(today, WEDDING_DATE));
  if (label === null) return null;

  return <p className={className}>{label}</p>;
}
