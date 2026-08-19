import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteShell } from "./site-shell";

describe("SiteShell", () => {
  it("renders the supplied eyebrow, site identity, and description", () => {
    render(
      <SiteShell
        eyebrow="Example eyebrow"
        title="Example Site"
        description="Example description."
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Example Site",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Example eyebrow")).toBeInTheDocument();
    expect(screen.getByText("Example description.")).toBeInTheDocument();
  });
});
