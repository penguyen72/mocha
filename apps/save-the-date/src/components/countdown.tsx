"use client";

import { useSyncExternalStore } from "react";

import { COUNTDOWN_EYEBROW, COUNTDOWN_TODAY, WEDDING_START } from "./invitation-content";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const WEDDING_START_MS = Date.parse(WEDDING_START);

export function splitCountdown(remainingMs: number) {
  const total = Math.floor(remainingMs / SECOND) * SECOND;
  return {
    days: Math.floor(total / DAY),
    hours: Math.floor((total % DAY) / HOUR),
    minutes: Math.floor((total % HOUR) / MINUTE),
    seconds: Math.floor((total % MINUTE) / SECOND),
  };
}

/** Ticks once a second; the snapshot is whole seconds, so it is stable between ticks. */
function subscribeToClock(onStoreChange: () => void) {
  const timer = setInterval(onStoreChange, SECOND);
  return () => clearInterval(timer);
}

function readNow() {
  return Math.floor(Date.now() / SECOND) * SECOND;
}

/** The server has no visitor's clock, so the countdown is a client-only detail. */
function readServerNow() {
  return null;
}

const pad = (value: number) => String(value).padStart(2, "0");

const plural = (value: number, unit: string) => `${value} ${unit}${value === 1 ? "" : "s"}`;

const EYEBROW =
  "m-0 font-sans text-[calc(8.5*var(--std-u))] font-medium uppercase leading-none " +
  "tracking-[0.22em] text-std-postmark-ink";

const NUMBER =
  "font-serif text-[calc(27*var(--std-u))] font-medium leading-none tabular-nums lining-nums text-std-note-ink";

const COLON = "pb-[calc(14*var(--std-u))] font-serif text-[calc(22*var(--std-u))] leading-none text-std-postmark-ink";

const LABEL =
  "mt-[calc(4*var(--std-u))] font-sans text-[calc(7*var(--std-u))] font-medium uppercase " +
  "leading-none tracking-[0.18em] text-std-accent-ink";

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex min-w-[calc(48*var(--std-u))] flex-col items-center">
      <span className={NUMBER}>{value}</span>
      <span className={LABEL}>{label}</span>
    </span>
  );
}

/**
 * A live days : hours : minutes : seconds countdown to the wedding. The ticking digits are
 * hidden from assistive technology, which gets the same time as one plain sentence instead
 * (deliberately not a live region, so it never interrupts every second).
 */
export function Countdown() {
  const now = useSyncExternalStore(subscribeToClock, readNow, readServerNow);
  if (now === null) return null;

  const remaining = WEDDING_START_MS - now;
  if (remaining <= -DAY) return null;
  if (remaining <= 0) {
    return <p className={EYEBROW}>{COUNTDOWN_TODAY}</p>;
  }

  const { days, hours, minutes, seconds } = splitCountdown(remaining);

  return (
    <div className="flex flex-col items-center gap-[calc(7*var(--std-u))]">
      <p className={EYEBROW}>{COUNTDOWN_EYEBROW}</p>
      <p className="sr-only">
        {`${plural(days, "day")}, ${plural(hours, "hour")}, ${plural(minutes, "minute")} and ${plural(seconds, "second")} to go`}
      </p>
      <div aria-hidden className="flex items-end gap-[calc(3*var(--std-u))]">
        <Unit value={String(days)} label="Days" />
        <span className={COLON}>:</span>
        <Unit value={pad(hours)} label="Hours" />
        <span className={COLON}>:</span>
        <Unit value={pad(minutes)} label="Minutes" />
        <span className={COLON}>:</span>
        <Unit value={pad(seconds)} label="Seconds" />
      </div>
    </div>
  );
}
