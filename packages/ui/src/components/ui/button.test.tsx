import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("renders as a button by default", () => {
    render(<Button>RSVP Now</Button>);
    expect(screen.getByRole("button", { name: "RSVP Now" })).toBeInTheDocument();
  });

  it("renders as its child element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="#rsvp">RSVP Now</a>
      </Button>,
    );
    expect(screen.getByRole("link", { name: "RSVP Now" })).toHaveAttribute("href", "#rsvp");
  });
});
