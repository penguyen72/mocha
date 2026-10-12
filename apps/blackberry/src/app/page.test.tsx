import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Home from "./page";

// Next.js supplies static image metadata; Vite otherwise imports a URL string.
vi.mock("@/assets/hero.jpeg", () => ({
  default: { src: "/hero.jpeg", width: 1600, height: 1200 },
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Blackberry RSVP entry points", () => {
  beforeEach(() => {
    // jsdom has no native dialog methods; keep the browser boundary narrow.
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  });

  it("links the desktop navigation and hero directly to Aisle Planner", () => {
    render(<Home />);

    const nav = screen.getByRole("navigation");
    const hero = screen.getByRole("heading", { level: 1 }).closest("section")!;

    for (const link of [
      within(nav).getByRole("link", { name: "RSVP" }),
      within(hero).getByRole("link", { name: "RSVP Now" }),
    ]) {
      expect(link).toHaveAttribute(
        "href",
        "https://www.aisleplanner.com/app/v2/our-wedding/blackberry/rsvp",
      );
      expect(link).not.toHaveAttribute("target");
    }
  });

  it("opens the sheet from the mobile menu and returns focus after the menu unmounts", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: query.includes("max-width"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));

    const link = within(screen.getByRole("navigation")).getByRole("link", { name: "RSVP" });
    expect(link).toHaveAttribute(
      "href",
      "https://www.aisleplanner.com/app/v2/our-wedding/blackberry/rsvp",
    );
    expect(link).not.toHaveAttribute("target");
    fireEvent.click(link);
    expect(screen.getByRole("dialog", { name: "Will you join us?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(link).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Close RSVP" }));
    expect(screen.getByRole("button", { name: "Menu" })).toHaveFocus();
  });

  it.each(["header", "hero", "section"])("opens the RSVP sheet from the %s", (entry) => {
    render(<Home />);
    const scope = entry === "header"
      ? screen.getByRole("navigation")
      : screen.getByRole("heading", { level: entry === "hero" ? 1 : 2, ...(entry === "section" ? { name: "RSVP" } : {}) }).closest("section")!;
    fireEvent.click(within(scope).getByRole("link", { name: entry === "header" ? "RSVP" : "RSVP Now" }));

    const sheet = screen.getByRole("dialog", { name: "Will you join us?" });
    expect(within(sheet).getByText(/continue to Aisle Planner to complete your response/)).toBeInTheDocument();
    expect(within(sheet).getByRole("link", { name: "Continue to RSVP" })).toHaveAttribute(
      "href", "https://www.aisleplanner.com/app/v2/our-wedding/blackberry/rsvp",
    );
    expect(within(sheet).queryByRole("textbox")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("closes the sheet and restores focus and page scrolling", () => {
    document.body.style.overflow = "auto";
    render(<Home />);
    const trigger = within(screen.getByRole("navigation")).getByRole("link", { name: "RSVP" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Close RSVP" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("auto");
    expect(trigger).toHaveFocus();
    document.body.style.overflow = "";
  });

  it("leaves modified RSVP clicks available for opening the destination in another tab", () => {
    render(<Home />);
    const trigger = within(screen.getByRole("navigation")).getByRole("link", { name: "RSVP" });
    let preventedBySheet: boolean | undefined;
    document.addEventListener("click", (event) => {
      preventedBySheet = event.defaultPrevented;
      // Avoid jsdom's unsupported document navigation after observing our handler.
      event.preventDefault();
    }, { once: true });
    fireEvent.click(trigger, { ctrlKey: true });

    expect(preventedBySheet).toBe(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("lets the sheet's Continue link navigate to Aisle Planner", () => {
    render(<Home />);
    fireEvent.click(within(screen.getByRole("navigation")).getByRole("link", { name: "RSVP" }));
    const sheet = screen.getByRole("dialog", { name: "Will you join us?" });
    let preventedBySheet: boolean | undefined;
    document.addEventListener("click", (event) => {
      preventedBySheet = event.defaultPrevented;
      event.preventDefault();
    }, { once: true });
    fireEvent.click(within(sheet).getByRole("link", { name: "Continue to RSVP" }));

    expect(preventedBySheet).toBe(false);
  });
});
