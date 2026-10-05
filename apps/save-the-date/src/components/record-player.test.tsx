import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  RECORD_HINT_PAUSE,
  RECORD_HINT_PLAY,
  RECORD_PAUSE_LABEL,
  RECORD_PLAY_LABEL,
} from "./invitation-content";
import { RecordPlayer } from "./record-player";
import { SongProvider } from "./song";

// jsdom does not implement media playback, so stand in for the browser: play and pause flip
// `paused` and fire the events a real audio element would.
let paused = true;
const play = vi.fn(function (this: HTMLMediaElement) {
  paused = false;
  this.dispatchEvent(new Event("play"));
  return Promise.resolve();
});
const pause = vi.fn(function (this: HTMLMediaElement) {
  paused = true;
  this.dispatchEvent(new Event("pause"));
});

// The song's download has its own tests; here it never lands, so the record streams it.
const fetchSong = vi.fn(() => new Promise<Response>(() => {}));

function disc() {
  const element = document.querySelector("button > span");
  if (!(element instanceof HTMLElement)) throw new Error("No disc rendered");
  return element;
}

function renderRecord(animated: boolean) {
  return render(
    <SongProvider>
      <RecordPlayer className="" animated={animated} />
    </SongProvider>,
  );
}

describe("RecordPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    paused = true;
    vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockImplementation(() => paused);
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(play);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pause);
    vi.stubGlobal("fetch", fetchSong);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("plays and pauses the song from the record", async () => {
    renderRecord(false);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: RECORD_PLAY_LABEL }));
    });
    expect(play).toHaveBeenCalledTimes(1);
    expect(screen.getByText(RECORD_HINT_PAUSE)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: RECORD_PAUSE_LABEL }));
    expect(pause).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: RECORD_PLAY_LABEL })).toBeInTheDocument();
  });

  it("stays ready to play if the browser refuses playback", async () => {
    play.mockImplementationOnce(() => Promise.reject(new DOMException("blocked", "NotAllowedError")));
    renderRecord(false);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: RECORD_PLAY_LABEL }));
    });

    expect(screen.getByRole("button", { name: RECORD_PLAY_LABEL })).toBeInTheDocument();
    expect(screen.getByText(RECORD_HINT_PLAY)).toBeInTheDocument();
  });

  it("spins in and settles as the invitation opens", () => {
    renderRecord(true);

    expect(disc()).toHaveClass("[animation:var(--std-anim-record-arrive)]");
    // The arrival must run before the first tap, so nothing may pause it.
    expect(disc().style.animationPlayState).toBe("");
  });

  it("rests without the arrival once the invitation is open", () => {
    renderRecord(false);
    expect(disc()).not.toHaveClass("[animation:var(--std-anim-record-arrive)]");
  });

  it("swaps the arrival for the spin once the song starts", async () => {
    renderRecord(true);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: RECORD_PLAY_LABEL }));
    });
    expect(disc()).toHaveClass("[animation:var(--std-anim-record-spin)]");
    expect(disc()).not.toHaveClass("[animation:var(--std-anim-record-arrive)]");
    expect(disc().style.animationPlayState).toBe("running");

    fireEvent.click(screen.getByRole("button", { name: RECORD_PAUSE_LABEL }));
    expect(disc().style.animationPlayState).toBe("paused");
  });
});
