import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RsvpSection } from "./rsvp-section";

describe("RsvpSection", () => {
  it("renders the static copy and composes the RSVP form", () => {
    render(<RsvpSection />);

    expect(screen.getByRole("heading", { level: 2, name: "RSVP" })).toBeInTheDocument();
    expect(screen.getByText("will you join us?")).toBeInTheDocument();
    expect(screen.getByText(/Kindly respond by/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Jordan & Alex Rivera")).toBeInTheDocument();
  });
});
