import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Hero } from "./hero";

describe("Hero", () => {
  it("renders the supplied copy, cta, and background image alt text", () => {
    render(
      <Hero
        eyebrow="together with their families"
        heading="Liane & Peyton"
        dateLabel="Oct 1–3, 2027"
        locationLabel="The Villa at Blackberry Ridge · Trenton, Georgia"
        cta={{ label: "RSVP Now", href: "#rsvp" }}
        backgroundImage={{
          src: { src: "/hero.jpg", height: 1200, width: 1600 },
          alt: "Liane and Peyton",
        }}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Liane & Peyton" })).toBeInTheDocument();
    expect(
      screen.getByText("The Villa at Blackberry Ridge · Trenton, Georgia"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "RSVP Now" })).toHaveAttribute("href", "#rsvp");
    expect(screen.getByAltText("Liane and Peyton")).toBeInTheDocument();
  });
});
