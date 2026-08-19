import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteShell } from "./site-shell";

describe("SiteShell", () => {
  it("renders the supplied site identity and description", () => {
    render(
      <SiteShell
        title="Canton — Liane & Peyton"
        description="Wedding website for family."
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Canton — Liane & Peyton",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Wedding website for family.")).toBeInTheDocument();
  });
});
