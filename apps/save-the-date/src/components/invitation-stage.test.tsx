import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ENVELOPE_BUTTON_LABEL,
  INVITATION_HEADING,
  NOTE_CTA_HREF,
  NOTE_CTA_LABEL,
  SEAL_MONOGRAM,
} from "./invitation-content";
import { OPENING_DURATION_MS } from "./invitation-phase";
import { InvitationStage } from "./invitation-stage";

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
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: NOTE_CTA_LABEL })).not.toBeInTheDocument();
  });

  it("reveals the invitation when the envelope is opened, and settles after the choreography", () => {
    vi.useFakeTimers();
    render(<InvitationStage />);

    fireEvent.click(screen.getByRole("button", { name: ENVELOPE_BUTTON_LABEL }));

    expect(screen.queryByRole("button", { name: ENVELOPE_BUTTON_LABEL })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: INVITATION_HEADING })).toBeInTheDocument();
    expect(window.location.hash).toBe("#open");

    // Still mid-choreography: the seal is on its way out but has not been dropped.
    expect(screen.getByText(SEAL_MONOGRAM)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(OPENING_DURATION_MS);
    });

    // Only reaching the `open` phase unmounts the seal layer.
    expect(screen.queryByText(SEAL_MONOGRAM)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: NOTE_CTA_LABEL })).toHaveAttribute(
      "href",
      NOTE_CTA_HREF,
    );
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
    expect(screen.getByRole("link", { name: NOTE_CTA_LABEL })).toBeInTheDocument();
  });

  it("opens straight away when the page is entered at #open", () => {
    window.history.replaceState(null, "", "/#open");
    render(<InvitationStage />);
    expect(screen.getByRole("heading", { level: 1, name: INVITATION_HEADING })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: ENVELOPE_BUTTON_LABEL })).not.toBeInTheDocument();
  });
});
