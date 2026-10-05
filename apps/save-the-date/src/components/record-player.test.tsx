import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

// The card fetches the song as it opens; each test decides when that download finishes.
let finishDownload: () => void = () => {};
const fetchSong = vi.fn(
  () =>
    new Promise<Response>((resolve) => {
      finishDownload = () => resolve(new Response("song"));
    }),
);
const SONG_URL = "blob:song";

function disc() {
  const element = document.querySelector("button > span");
  if (!(element instanceof HTMLElement)) throw new Error("No disc rendered");
  return element;
}

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
    vi.stubGlobal("fetch", fetchSong);
    URL.createObjectURL = vi.fn(() => SONG_URL);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts downloading the song as the card opens, without playing it", () => {
    render(<RecordPlayer className="" animated={false} />);

    expect(screen.getByRole("button", { name: RECORD_PLAY_LABEL })).toBeInTheDocument();
    expect(screen.getByText(RECORD_HINT_PLAY)).toBeInTheDocument();
    expect(fetchSong).toHaveBeenCalledWith(SONG_SRC, expect.anything());
    // Until the download lands, a tap streams the song as before.
    expect(audio()).toHaveAttribute("src", SONG_SRC);
    expect(audio()).toHaveAttribute("preload", "none");
    expect(audio()).not.toHaveAttribute("controls");
    expect(play).not.toHaveBeenCalled();
  });

  it("plays the downloaded song so a tap starts the music at once", async () => {
    render(<RecordPlayer className="" animated={false} />);

    finishDownload();
    await waitFor(() => expect(audio()).toHaveAttribute("src", SONG_URL));
    expect(play).not.toHaveBeenCalled();
  });

  it("keeps streaming a song that started before the download finished", async () => {
    render(<RecordPlayer className="" animated={false} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: RECORD_PLAY_LABEL }));
    });

    await act(async () => {
      finishDownload();
    });
    expect(audio()).toHaveAttribute("src", SONG_SRC);
  });

  it("releases the downloaded song when the card closes", async () => {
    const { unmount } = render(<RecordPlayer className="" animated={false} />);
    finishDownload();
    await waitFor(() => expect(audio()).toHaveAttribute("src", SONG_URL));

    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(SONG_URL);
  });

  it("loops the song", () => {
    render(<RecordPlayer className="" animated={false} />);
    expect(audio().loop).toBe(true);
  });

  it("plays and pauses the song from the record", async () => {
    render(<RecordPlayer className="" animated={false} />);

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
    render(<RecordPlayer className="" animated={false} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: RECORD_PLAY_LABEL }));
    });

    expect(screen.getByRole("button", { name: RECORD_PLAY_LABEL })).toBeInTheDocument();
    expect(screen.getByText(RECORD_HINT_PLAY)).toBeInTheDocument();
  });

  it("spins in and settles as the invitation opens", () => {
    render(<RecordPlayer className="" animated />);

    expect(disc()).toHaveClass("[animation:var(--std-anim-record-arrive)]");
    // The arrival must run before the first tap, so nothing may pause it.
    expect(disc().style.animationPlayState).toBe("");
  });

  it("rests without the arrival once the invitation is open", () => {
    render(<RecordPlayer className="" animated={false} />);
    expect(disc()).not.toHaveClass("[animation:var(--std-anim-record-arrive)]");
  });

  it("swaps the arrival for the spin once the song starts", async () => {
    render(<RecordPlayer className="" animated />);

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
