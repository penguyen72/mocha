import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("renders the supplied heading, subline, and tagline", () => {
    render(
      <SiteFooter
        heading="Liane & Peyton"
        subline="October 1–3, 2027 · Trenton, Georgia"
        tagline="Made with love for our favorite people."
      />,
    );

    expect(screen.getByText("Liane & Peyton")).toBeInTheDocument();
    expect(screen.getByText("October 1–3, 2027 · Trenton, Georgia")).toBeInTheDocument();
    expect(screen.getByText("Made with love for our favorite people.")).toBeInTheDocument();
  });
});
