import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Schedule } from "./schedule";
import { SCHEDULE_EVENTS } from "./schedule-content";

describe("Schedule", () => {
  it("renders every event's time, title, and description", () => {
    render(<Schedule />);
    for (const event of SCHEDULE_EVENTS) {
      const heading = screen.getByRole("heading", { level: 3, name: event.title });
      const card = heading.parentElement!;
      expect(within(card).getByText(event.time)).toBeInTheDocument();
      expect(within(card).getByText(event.description)).toBeInTheDocument();
    }
  });

  it("renders exactly one day badge per distinct day, collapsing same-day events", () => {
    render(<Schedule />);
    expect(screen.getAllByText("Friday · October 15")).toHaveLength(1);
    expect(screen.getByText("Sunday · October 17")).toBeInTheDocument();
    expect(screen.getAllByText("Saturday · October 16 · The Big Day")).toHaveLength(1);
  });
});
