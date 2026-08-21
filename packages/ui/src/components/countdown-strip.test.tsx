import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CountdownStrip } from "./countdown-strip";

describe("CountdownStrip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-10-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders zero-padded units and ticks down over time", () => {
    const target = new Date("2027-10-01T00:00:00.000Z");
    target.setUTCDate(target.getUTCDate() + 1);
    target.setUTCHours(2, 3, 5, 0);

    render(<CountdownStrip tagline="We can't wait to celebrate with you" targetDate={target.toISOString()} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("05")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("04")).toBeInTheDocument();
  });

  it("floors every unit at zero once the target has passed", () => {
    render(<CountdownStrip tagline="We can't wait to celebrate with you" targetDate="2020-01-01T00:00:00.000Z" />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getAllByText("00")).toHaveLength(3);
  });
});
