import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SiteNav } from "./site-nav";

const links = [
  { label: "Schedule", href: "#schedule" },
  { label: "RSVP", href: "#rsvp" },
];
const cta = { label: "RSVP Now", href: "#rsvp" };

function mockMobileViewport() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as typeof window.matchMedia;
}

describe("SiteNav", () => {
  it("renders the supplied links and call-to-action from props", () => {
    render(<SiteNav brand={<span>L &amp; P</span>} links={links} cta={cta} />);

    expect(screen.getByRole("link", { name: "Schedule" })).toHaveAttribute("href", "#schedule");
    expect(screen.getByRole("link", { name: "RSVP Now" })).toHaveAttribute("href", "#rsvp");
  });

  it("opens and closes the mobile menu when the burger button is clicked", () => {
    mockMobileViewport();
    render(<SiteNav brand={<span>L &amp; P</span>} links={links} cta={cta} />);

    const burger = screen.getByRole("button", { name: "Menu" });
    expect(burger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(burger);
    expect(burger).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(burger);
    expect(burger).toHaveAttribute("aria-expanded", "false");
  });
});
