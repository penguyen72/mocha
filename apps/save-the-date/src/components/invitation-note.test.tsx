import { readFileSync } from "node:fs";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InvitationNote } from "./invitation-note";
import { CALENDAR_LABEL, NOTE_TEXT, REPLAY_LABEL } from "./invitation-content";

describe("InvitationNote", () => {
  it("says a formal invitation will follow", () => {
    render(<InvitationNote animated={false} onReplay={vi.fn()} />);
    expect(screen.getByText(NOTE_TEXT)).toBeInTheDocument();
  });

  it("reveals calendar choices only when requested", async () => {
    render(<InvitationNote animated={false} onReplay={vi.fn()} />);
    const button = screen.getByRole("button", { name: CALENDAR_LABEL });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Google Calendar" })).not.toBeInTheDocument();

    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Google Calendar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Apple Calendar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download calendar file" })).toBeInTheDocument();

    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("prefills Google with the same all-day wedding event as the calendar file", async () => {
    render(<InvitationNote animated={false} onReplay={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: CALENDAR_LABEL }));

    const google = screen.getByRole("link", { name: "Google Calendar" });
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

  it("offers an Apple subscription to the calendar on the current host", async () => {
    render(<InvitationNote animated={false} onReplay={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: CALENDAR_LABEL }));

    const apple = screen.getByRole("link", { name: "Apple Calendar" });
    const url = new URL(apple.getAttribute("href")!);
    expect(url.protocol).toBe("webcal:");
    expect(url.host).toBe(window.location.host);
    expect(url.pathname).toBe("/peyton-and-liane.ics");
    expect(apple).toHaveAccessibleDescription("Adds a subscribed calendar with the wedding date.");
  });

  it("provides a direct calendar-file download as a fallback", async () => {
    render(<InvitationNote animated={false} onReplay={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: CALENDAR_LABEL }));
    const download = screen.getByRole("link", { name: "Download calendar file" });
    expect(download).toHaveAttribute("href", "/peyton-and-liane.ics");
    expect(download).toHaveAttribute("download", "peyton-and-liane.ics");
  });

  it("supports keyboard opening, link navigation, and Escape with focus restored", async () => {
    const user = userEvent.setup();
    render(<InvitationNote animated={false} onReplay={vi.fn()} />);
    const button = screen.getByRole("button", { name: CALENDAR_LABEL });
    button.focus();
    await user.keyboard("{Enter}");
    await user.tab();
    expect(screen.getByRole("link", { name: "Google Calendar" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Apple Calendar" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Download calendar file" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Google Calendar" })).not.toBeInTheDocument();
  });

  it("dismisses choices when clicking outside", async () => {
    render(<InvitationNote animated={false} onReplay={vi.fn()} />);
    const button = screen.getByRole("button", { name: CALENDAR_LABEL });
    await userEvent.click(button);
    await userEvent.click(screen.getByText(NOTE_TEXT));
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("dismisses choices when focus leaves the chooser", async () => {
    const user = userEvent.setup();
    render(<InvitationNote animated={false} onReplay={vi.fn()} />);
    const button = screen.getByRole("button", { name: CALENDAR_LABEL });
    await user.click(button);
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: REPLAY_LABEL })).toHaveFocus();
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("replays the invitation on request", async () => {
    const onReplay = vi.fn();
    render(<InvitationNote animated={false} onReplay={onReplay} />);
    await userEvent.click(screen.getByRole("button", { name: REPLAY_LABEL }));
    expect(onReplay).toHaveBeenCalledTimes(1);
  });
});
