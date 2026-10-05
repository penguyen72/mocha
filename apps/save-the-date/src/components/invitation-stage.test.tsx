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
import { SONG_FADE_OUT_MS } from "./song";

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

// jsdom does not implement media playback, so stand in for the song: these tests only check
// when the stage starts and stops it.
const playSong = vi.fn(() => Promise.resolve());
const pauseSong = vi.fn();

describe("InvitationStage", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    setReducedMotion(false);
    playSong.mockClear();
    pauseSong.mockClear();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(playSong);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pauseSong);
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(() => {})));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("starts the song with the tap that opens the envelope", () => {
    render(<InvitationStage />);
    expect(playSong).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: ENVELOPE_BUTTON_LABEL }));
    expect(playSong).toHaveBeenCalledTimes(1);
  });

  it("leaves the song for the record when the page is entered already open", () => {
    window.history.replaceState(null, "", "/#open");
    render(<InvitationStage />);
    expect(playSong).not.toHaveBeenCalled();
  });

  it("plays the song through the closing and stops and rewinds it once the envelope is shut", () => {
    vi.useFakeTimers();
    window.history.replaceState(null, "", "/#open");
    render(<InvitationStage />);
    const song = document.querySelector("audio")!;
    song.currentTime = 30;

    fireEvent.click(screen.getByRole("button", { name: REPLAY_LABEL }));
    expect(pauseSong).not.toHaveBeenCalled();
    expect(song.currentTime).toBe(30);

    act(() => {
      vi.advanceTimersByTime(CLOSING_DURATION_MS);
    });
    expect(pauseSong).toHaveBeenCalledTimes(1);
    expect(song.currentTime).toBe(0);
  });

  it("still fades the song out when resealing under reduced motion", () => {
    vi.useFakeTimers();
    setReducedMotion(true);
    window.history.replaceState(null, "", "/#open");
    render(<InvitationStage />);

    fireEvent.click(screen.getByRole("button", { name: REPLAY_LABEL }));
    expect(pauseSong).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(SONG_FADE_OUT_MS);
    });
    expect(pauseSong).toHaveBeenCalledTimes(1);
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

  it("marks the stage as sealed only while it shows the sealed envelope", () => {
    const { container } = render(<InvitationStage />);
    const frame = container.firstElementChild as HTMLElement;
    expect(frame).toHaveAttribute("data-stage");
    expect(frame).toHaveAttribute("data-sealed");

    fireEvent.click(screen.getByRole("button", { name: ENVELOPE_BUTTON_LABEL }));

    expect(frame).not.toHaveAttribute("data-sealed");
  });

  it("eases the floating envelope and swollen seal back from where they were when clicked", () => {
    const realStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) => {
      if (element.hasAttribute("data-envelope-float")) {
        return { transform: "matrix(1, 0, 0, 1, 0, -3.5)" } as CSSStyleDeclaration;
      }
      if (element.hasAttribute("data-seal-rest")) return { scale: "0.97" } as CSSStyleDeclaration;
      if (element.hasAttribute("data-seal-swell")) return { scale: "1.04" } as CSSStyleDeclaration;
      return realStyle(element, pseudo);
    });
    const { container } = render(<InvitationStage />);
    const frame = container.firstElementChild as HTMLElement;

    fireEvent.click(screen.getByRole("button", { name: ENVELOPE_BUTTON_LABEL }));

    expect(frame.style.getPropertyValue("--std-float-from")).toBe("-3.5px");
    expect(frame.style.getPropertyValue("--std-seal-from")).toBe("1.009");
    vi.restoreAllMocks();
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

    // One closing, plus the song fading out alongside it.
    expect(vi.getTimerCount()).toBe(2);
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

  it("tilts the cards toward a mouse, but leaves them still under a finger", () => {
    window.history.replaceState(null, "", "/#open");
    const { container } = render(<InvitationStage />);
    const stage = container.querySelector<HTMLElement>("[data-stage]")!;

    fireEvent.pointerMove(stage, { pointerType: "touch", clientX: 0, clientY: 0 });
    expect(stage.style.getPropertyValue("--std-tilt-x")).toBe("");

    fireEvent.pointerMove(stage, { pointerType: "mouse", clientX: 0, clientY: 0 });
    expect(stage.style.getPropertyValue("--std-tilt-x")).not.toBe("");
  });

  it("opens straight away when the page is entered at #open", () => {
    window.history.replaceState(null, "", "/#open");
    render(<InvitationStage />);
    expect(screen.getByRole("heading", { level: 1, name: INVITATION_HEADING })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: ENVELOPE_BUTTON_LABEL })).not.toBeInTheDocument();
  });
});
