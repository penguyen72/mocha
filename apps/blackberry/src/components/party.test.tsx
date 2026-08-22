import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Party } from "./party";
import { PARTY_MEMBERS } from "./party-content";

describe("Party", () => {
  it("renders a card for every member with their name, role, and For line", () => {
    render(<Party />);
    for (const member of PARTY_MEMBERS) {
      const card = screen.getByRole("article", { name: member.name });
      expect(within(card).getByText(member.role)).toBeInTheDocument();
      expect(within(card).getByText(`For ${member.for}`)).toBeInTheDocument();
    }
  });

  it("renders initials for every member's avatar placeholder", () => {
    render(<Party />);
    expect(screen.getByText("MC")).toBeInTheDocument(); // Maya Chen
    expect(screen.getByText("PA")).toBeInTheDocument(); // Priya Anand
    expect(screen.getByText("SR")).toBeInTheDocument(); // Sofia Reyes
    expect(screen.getByText("GO")).toBeInTheDocument(); // Grace Okoro
    expect(screen.getByText("DC")).toBeInTheDocument(); // Daniel Cole
    expect(screen.getByText("MW")).toBeInTheDocument(); // Marcus Webb
    expect(screen.getByText("EN")).toBeInTheDocument(); // Eli Nakamura
    expect(screen.getByText("TB")).toBeInTheDocument(); // Theo Brandt
  });
});
