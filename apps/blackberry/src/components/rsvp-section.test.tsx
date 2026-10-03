import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RsvpSection } from "./rsvp-section";

describe("RsvpSection", () => {
  it("offers an Aisle Planner RSVP link instead of collecting responses locally", () => {
    const { container } = render(<RsvpSection />);

    expect(screen.getByRole("heading", { level: 2, name: "RSVP" })).toBeInTheDocument();
    expect(screen.getByText("will you join us?")).toBeInTheDocument();
    expect(screen.getByText(/Kindly respond by/)).toBeInTheDocument();
    expect(screen.getByText("August 1, 2027")).toBeInTheDocument();
    expect(screen.getByText(/continue to Aisle Planner/)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "RSVP Now" });
    expect(link).toHaveAttribute(
      "href",
      "https://www.aisleplanner.com/app/v2/our-wedding/blackberry/rsvp",
    );
    expect(link).not.toHaveAttribute("target");
    expect(container.querySelector("form")).toBeNull();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
