import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ENVELOPE_BUTTON_LABEL,
  MAIL_EYEBROW,
  INVITATION_HEADING,
  NOTE_TEXT,
  REPLAY_LABEL,
} from "./invitation-content";
import { CLOSING_DURATION_MS, OPENING_DURATION_MS } from "./invitation-phase";
import { InvitationStage } from "./invitation-stage";

// The live countdown runs its own one-second clock; these tests are about the opening
// choreography's timer, so the countdown is stubbed out (it has its own tests).
vi.mock("./countdown", () => ({ Countdown: () => null }));

const sealCount = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("img")).filter((img) =>
    decodeURIComponent(img.getAttribute("src") ?? "").includes("/images/wax-seal.png"),
  ).length;

function setReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

describe("InvitationStage", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    setReducedMotion(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts closed: the envelope control is offered and the invitation is not yet shown", () => {
    render(<InvitationStage />);
    expect(screen.getByRole("button", { name: ENVELOPE_BUTTON_LABEL })).toBeInTheDocument();
    expect(screen.getByText(MAIL_EYEBROW)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(screen.queryByText(NOTE_TEXT)).not.toBeInTheDocument();
  });

  it("saves the falling petals as a surprise for when the envelope opens", () => {
    const { container } = render(<InvitationStage />);
    expect(container.querySelectorAll("[data-petal]")).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: ENVELOPE_BUTTON_LABEL }));

    expect(container.querySelectorAll("[data-petal]").length).toBeGreaterThan(0);
  });

  it("reveals the invitation when the envelope is opened, and settles after the choreography", () => {
    vi.useFakeTimers();
    const { container } = render(<InvitationStage />);

    fireEvent.click(screen.getByRole("button", { name: ENVELOPE_BUTTON_LABEL }));

    expect(screen.queryByRole("button", { name: ENVELOPE_BUTTON_LABEL })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: INVITATION_HEADING })).toBeInTheDocument();
    expect(window.location.hash).toBe("#open");

    // Still mid-choreography: the cracked seal is on its way out but has not been dropped.
    expect(sealCount(container)).toBe(2);

    act(() => {
      vi.advanceTimersByTime(OPENING_DURATION_MS);
    });

    // Only reaching the `open` phase unmounts the seal layer and the "you have mail" header.
    expect(sealCount(container)).toBe(0);
    expect(screen.queryByText(MAIL_EYEBROW)).not.toBeInTheDocument();
    expect(screen.getByText(NOTE_TEXT)).toBeInTheDocument();
  });

  it("moves focus to the invitation heading once the choreography completes", () => {
    vi.useFakeTimers();
    render(<InvitationStage />);

    fireEvent.click(screen.getByRole("button", { name: ENVELOPE_BUTTON_LABEL }));
    expect(document.activeElement).not.toBe(
      screen.getByRole("heading", { level: 1, name: INVITATION_HEADING }),
    );

    act(() => {
      vi.advanceTimersByTime(OPENING_DURATION_MS);
    });

    expect(document.activeElement).toBe(
      screen.getByRole("heading", { level: 1, name: INVITATION_HEADING }),
    );
  });

  it("clears the pending timer when unmounted mid-choreography", () => {
    vi.useFakeTimers();
    const { unmount } = render(<InvitationStage />);

    fireEvent.click(screen.getByRole("button", { name: ENVELOPE_BUTTON_LABEL }));
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it("skips the choreography entirely under reduced motion", () => {
    vi.useFakeTimers();
    setReducedMotion(true);
    render(<InvitationStage />);

    fireEvent.click(screen.getByRole("button", { name: ENVELOPE_BUTTON_LABEL }));

    // No pending timer means the stage went straight to the open phase.
    expect(vi.getTimerCount()).toBe(0);
    expect(screen.getByRole("heading", { level: 1, name: INVITATION_HEADING })).toBeInTheDocument();
    expect(screen.getByText(NOTE_TEXT)).toBeInTheDocument();
  });

  it("tucks the invitation back into the envelope before resealing it", () => {
    vi.useFakeTimers();
    window.history.replaceState(null, "", "/#open");
    const { container } = render(<InvitationStage />);

    fireEvent.click(screen.getByRole("button", { name: REPLAY_LABEL }));

    // Mid-close: the cards and note are still going back in, the flap has not shut, and a
    // whole seal is pressing on. The hash clears straight away.
    expect(window.location.hash).toBe("");
    expect(screen.queryByRole("button", { name: ENVELOPE_BUTTON_LABEL })).not.toBeInTheDocument();
    expect(screen.getByText(NOTE_TEXT)).toBeInTheDocument();
    expect(screen.getByText(NOTE_TEXT).closest("[inert]")).not.toBeNull();
    expect(sealCount(container)).toBe(1);

    act(() => {
      vi.advanceTimersByTime(CLOSING_DURATION_MS);
    });

    const envelope = screen.getByRole("button", { name: ENVELOPE_BUTTON_LABEL });
    expect(document.activeElement).toBe(envelope);
    expect(screen.queryByText(NOTE_TEXT)).not.toBeInTheDocument();
    expect(screen.getByText(MAIL_EYEBROW)).toBeInTheDocument();
  });

  it("ignores a second request to open again while the envelope is closing", () => {
    vi.useFakeTimers();
    window.history.replaceState(null, "", "/#open");
    render(<InvitationStage />);

    const replay = screen.getByRole("button", { name: REPLAY_LABEL });
    fireEvent.click(replay);
    fireEvent.click(replay);

    expect(vi.getTimerCount()).toBe(1);
  });

  it("can be opened again once it has resealed", () => {
    vi.useFakeTimers();
    window.history.replaceState(null, "", "/#open");
    render(<InvitationStage />);

    fireEvent.click(screen.getByRole("button", { name: REPLAY_LABEL }));
    act(() => {
      vi.advanceTimersByTime(CLOSING_DURATION_MS);
    });
    fireEvent.click(screen.getByRole("button", { name: ENVELOPE_BUTTON_LABEL }));

    expect(window.location.hash).toBe("#open");
    expect(screen.getByRole("heading", { level: 1, name: INVITATION_HEADING })).toBeInTheDocument();
  });

  it("reseals at once under reduced motion and returns focus to the envelope", () => {
    setReducedMotion(true);
    window.history.replaceState(null, "", "/#open");
    render(<InvitationStage />);

    fireEvent.click(screen.getByRole("button", { name: REPLAY_LABEL }));

    const envelope = screen.getByRole("button", { name: ENVELOPE_BUTTON_LABEL });
    expect(document.activeElement).toBe(envelope);
    expect(window.location.hash).toBe("");
    expect(screen.queryByText(NOTE_TEXT)).not.toBeInTheDocument();
  });

  it("opens straight away when the page is entered at #open", () => {
    window.history.replaceState(null, "", "/#open");
    render(<InvitationStage />);
    expect(screen.getByRole("heading", { level: 1, name: INVITATION_HEADING })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: ENVELOPE_BUTTON_LABEL })).not.toBeInTheDocument();
  });
});
