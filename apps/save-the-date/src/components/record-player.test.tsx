import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  RECORD_HINT_PAUSE,
  RECORD_HINT_PLAY,
  RECORD_PAUSE_LABEL,
  RECORD_PLAY_LABEL,
  SONG_SRC,
} from "./invitation-content";
import { RecordPlayer } from "./record-player";

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

function audio() {
  const element = document.querySelector("audio");
  if (element === null) throw new Error("No audio element rendered");
  return element;
}

describe("RecordPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    paused = true;
    vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockImplementation(() => paused);
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(play);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pause);
  });

  it("waits for a tap before downloading the song", () => {
    render(<RecordPlayer className="" />);

    expect(screen.getByRole("button", { name: RECORD_PLAY_LABEL })).toBeInTheDocument();
    expect(screen.getByText(RECORD_HINT_PLAY)).toBeInTheDocument();
    expect(audio()).toHaveAttribute("src", SONG_SRC);
    expect(audio()).toHaveAttribute("preload", "none");
    expect(audio()).not.toHaveAttribute("controls");
    expect(play).not.toHaveBeenCalled();
  });

  it("loops the song", () => {
    render(<RecordPlayer className="" />);
    expect(audio().loop).toBe(true);
  });

  it("plays and pauses the song from the record", async () => {
    render(<RecordPlayer className="" />);

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
    render(<RecordPlayer className="" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: RECORD_PLAY_LABEL }));
    });

    expect(screen.getByRole("button", { name: RECORD_PLAY_LABEL })).toBeInTheDocument();
    expect(screen.getByText(RECORD_HINT_PLAY)).toBeInTheDocument();
  });
});
