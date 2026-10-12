import { readFileSync } from "node:fs";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AddToCalendar } from "./add-to-calendar";
import {
  CALENDAR_CHOICES,
  CALENDAR_DISMISS,
  CALENDAR_LABEL,
  CALENDAR_SHEET_TITLE,
  CALENDAR_SHEET_WHEN,
} from "./invitation-content";

const name = (choice: keyof typeof CALENDAR_CHOICES) =>
  new RegExp(CALENDAR_CHOICES[choice].name);

async function openSheet() {
  const user = userEvent.setup();
  render(<AddToCalendar />);
  const trigger = screen.getByRole("button", { name: CALENDAR_LABEL });
  await user.click(trigger);
  return { user, trigger, sheet: screen.getByRole("dialog", { name: CALENDAR_SHEET_TITLE }) };
}

// jsdom cannot navigate, so stop choosing a link from trying to.
const preventNavigation = (event: MouseEvent) => event.preventDefault();
beforeEach(() => document.addEventListener("click", preventNavigation));
afterEach(() => document.removeEventListener("click", preventNavigation));

describe("AddToCalendar", () => {
  it("opens the calendar sheet only when asked", async () => {
    render(<AddToCalendar />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: CALENDAR_LABEL });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await userEvent.click(trigger);

    const sheet = screen.getByRole("dialog", { name: CALENDAR_SHEET_TITLE });
    expect(sheet).toHaveAttribute("open");
    expect(sheet).toHaveTextContent(CALENDAR_SHEET_WHEN);
  });

  it("describes each calendar choice", async () => {
    await openSheet();
    for (const { name, hint } of Object.values(CALENDAR_CHOICES)) {
      expect(screen.getByRole("link", { name: new RegExp(name) })).toHaveTextContent(hint);
    }
  });

  it("prefills Google with the same all-day wedding event as the calendar file", async () => {
    await openSheet();
    const google = screen.getByRole("link", { name: name("google") });
    const url = new URL(google.getAttribute("href")!);
    expect(url.origin).toBe("https://calendar.google.com");
    expect(url.pathname).toBe("/calendar/r/eventedit");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("dates")).toBe("20271016/20271017");
    expect(url.searchParams.get("text")).toBe("Peyton & Liane's Wedding");
    expect(url.searchParams.get("location")).toBe("Trenton, Georgia");
    expect(url.searchParams.get("details")).toBe("Save the date! Formal invitation to follow.");
    expect(google).toHaveAttribute("target", "_blank");
    expect(google).toHaveAttribute("rel", "noopener noreferrer");

    const calendar = readFileSync("public/peyton-and-liane.ics", "utf8");
    const [start, end] = url.searchParams.get("dates")!.split("/");
    expect(calendar).toContain(`DTSTART;VALUE=DATE:${start}\r\n`);
    expect(calendar).toContain(`DTEND;VALUE=DATE:${end}\r\n`);
    expect(calendar).toContain(`SUMMARY:${url.searchParams.get("text")}\r\n`);
    expect(calendar).toContain("LOCATION:Trenton\\, Georgia\r\n");
    expect(calendar).toContain(`DESCRIPTION:${url.searchParams.get("details")}\r\n`);
  });

  it("adds a single event to Apple Calendar instead of subscribing", async () => {
    await openSheet();
    const apple = screen.getByRole("link", { name: name("apple") });
    expect(apple).toHaveAttribute("href", "/peyton-and-liane.ics");
    expect(apple).not.toHaveAttribute("download");
    for (const link of screen.getAllByRole("link")) {
      expect(link.getAttribute("href")).not.toMatch(/^webcal:/);
    }
  });

  it("downloads the calendar file for Outlook and other apps", async () => {
    await openSheet();
    const file = screen.getByRole("link", { name: name("file") });
    expect(file).toHaveAttribute("href", "/peyton-and-liane.ics");
    expect(file).toHaveAttribute("download", "peyton-and-liane.ics");
  });

  it("closes on Escape and returns focus to the button", async () => {
    const { user, trigger, sheet } = await openSheet();
    await user.keyboard("{Escape}");
    expect(sheet).not.toHaveAttribute("open");
    expect(trigger).toHaveFocus();
  });

  it("closes on Not now and returns focus to the button", async () => {
    const { user, trigger, sheet } = await openSheet();
    await user.click(screen.getByRole("button", { name: CALENDAR_DISMISS }));
    expect(sheet).not.toHaveAttribute("open");
    expect(trigger).toHaveFocus();
  });

  it("closes on a click on the backdrop but not inside the sheet", async () => {
    const { user, trigger, sheet } = await openSheet();
    await user.click(screen.getByRole("heading", { name: CALENDAR_SHEET_TITLE }));
    expect(sheet).toHaveAttribute("open");

    // A click on the ::backdrop is dispatched to the <dialog> element itself.
    await user.click(sheet);
    expect(sheet).not.toHaveAttribute("open");
    expect(trigger).toHaveFocus();
  });

  it.each(["google", "apple", "file"] as const)(
    "closes after choosing %s",
    async (choice) => {
      const { user, trigger, sheet } = await openSheet();
      await user.click(screen.getByRole("link", { name: name(choice) }));
      expect(sheet).not.toHaveAttribute("open");
      expect(trigger).toHaveFocus();
    },
  );
});
