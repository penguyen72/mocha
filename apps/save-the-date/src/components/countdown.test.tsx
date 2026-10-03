import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Countdown, countdownLabel, daysBetween } from "./countdown";

describe("daysBetween", () => {
  it("counts whole calendar days between two local dates", () => {
    expect(daysBetween("2026-10-02", "2027-10-16")).toBe(379);
    expect(daysBetween("2027-10-15", "2027-10-16")).toBe(1);
    expect(daysBetween("2027-10-16", "2027-10-16")).toBe(0);
    expect(daysBetween("2027-10-17", "2027-10-16")).toBe(-1);
  });

  it("is not thrown off by a daylight-saving change in between", () => {
    expect(daysBetween("2027-03-13", "2027-03-15")).toBe(2);
  });
});

describe("countdownLabel", () => {
  it("counts down in days, then celebrates on the day, then says nothing", () => {
    expect(countdownLabel(379)).toBe("379 days to go");
    expect(countdownLabel(1)).toBe("1 day to go");
    expect(countdownLabel(0)).toBe("Today’s the day!");
    expect(countdownLabel(-1)).toBeNull();
  });
});

describe("Countdown", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the days left from today's local date", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 2, 21, 30));
    render(<Countdown className="" />);
    expect(screen.getByText("379 days to go")).toBeInTheDocument();
  });

  it("renders nothing once the wedding has passed", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2027, 9, 18, 9, 0));
    const { container } = render(<Countdown className="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
