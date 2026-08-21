import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Reveal } from "./reveal";

function setReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? matches : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as typeof window.matchMedia;
}

describe("Reveal", () => {
  beforeEach(() => {
    setReducedMotion(false);
  });

  it("renders its children with the default viewport trigger", () => {
    render(
      <Reveal>
        <p>Schedule of Events</p>
      </Reveal>,
    );
    expect(screen.getByText("Schedule of Events")).toBeInTheDocument();
  });

  it("renders its children with the mount trigger", () => {
    render(
      <Reveal trigger="mount">
        <p>Liane & Peyton</p>
      </Reveal>,
    );
    expect(screen.getByText("Liane & Peyton")).toBeInTheDocument();
  });

  it("renders already visible, with no animation, when the user prefers reduced motion", () => {
    setReducedMotion(true);
    render(
      <Reveal trigger="mount" delay={0.5}>
        <p>Reduced motion</p>
      </Reveal>,
    );
    expect(screen.getByText("Reduced motion")).toHaveStyle({ opacity: "1" });
  });
});
