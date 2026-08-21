import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Schedule } from "./schedule";
import { SCHEDULE_EVENTS } from "./schedule-content";

describe("Schedule", () => {
  it("renders every event's time, title, and description", () => {
    render(<Schedule />);
    for (const event of SCHEDULE_EVENTS) {
      expect(screen.getByText(event.time)).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 3, name: event.title })).toBeInTheDocument();
      expect(screen.getByText(event.description)).toBeInTheDocument();
    }
  });

  it("renders exactly one day badge per distinct day, collapsing same-day events", () => {
    render(<Schedule />);
    expect(screen.getByText("Friday · October 1")).toBeInTheDocument();
    expect(screen.getByText("Sunday · October 3")).toBeInTheDocument();
    expect(screen.getAllByText("Saturday · October 2 · The Big Day")).toHaveLength(1);
  });
});
