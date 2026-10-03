import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Countdown, splitCountdown } from "./countdown";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("splitCountdown", () => {
  it("splits the time left into days, hours, minutes and seconds", () => {
    expect(splitCountdown(378 * DAY + 2 * HOUR + 30 * MINUTE + 7 * SECOND)).toEqual({
      days: 378,
      hours: 2,
      minutes: 30,
      seconds: 7,
    });
  });

  it("rounds partial seconds down", () => {
    expect(splitCountdown(59.9 * SECOND)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 59 });
  });
});

describe("Countdown", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down to midnight Eastern on the wedding day, and ticks every second", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-02T21:30:00-04:00"));
    render(<Countdown />);

    expect(screen.getByText("378")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("00")).toBeInTheDocument();
    expect(screen.getByText(/378 days, 2 hours, 30 minutes and 0 seconds to go/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(SECOND);
    });
    expect(screen.getByText("29")).toBeInTheDocument();
    expect(screen.getByText("59")).toBeInTheDocument();
  });

  it("celebrates on the day itself", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-10-16T15:00:00-04:00"));
    render(<Countdown />);
    expect(screen.getByText("Today’s the day!")).toBeInTheDocument();
  });

  it("renders nothing once the wedding day has passed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-10-18T09:00:00-04:00"));
    const { container } = render(<Countdown />);
    expect(container).toBeEmptyDOMElement();
  });
});
