import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SONG_SRC } from "./invitation-content";
import { SONG_VOLUME, SongProvider, useSong } from "./song";

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

// The page fetches the song as it loads; each test decides when that download finishes.
let finishDownload: () => void = () => {};
const fetchSong = vi.fn(
  () =>
    new Promise<Response>((resolve) => {
      finishDownload = () => resolve(new Response("song"));
    }),
);
const SONG_URL = "blob:song";

/** Stands in for Web Audio: records the volume points each fade schedules. */
class FakeAudioContext {
  static last: FakeAudioContext | null = null;
  currentTime = 0;
  ramps: number[] = [];
  gain = {
    gain: {
      value: 1,
      cancelScheduledValues: vi.fn(),
      setValueAtTime: vi.fn((value: number) => {
        this.gain.gain.value = value;
      }),
      linearRampToValueAtTime: vi.fn((value: number) => {
        this.ramps.push(value);
      }),
    },
    connect: (node: unknown) => node,
  };
  destination = {};
  resume = vi.fn(() => Promise.resolve());
  close = vi.fn(() => Promise.resolve());
  constructor() {
    FakeAudioContext.last = this;
  }
  createGain() {
    return this.gain;
  }
  createMediaElementSource() {
    return { connect: (node: unknown) => node };
  }
}

function mixer() {
  if (FakeAudioContext.last === null) throw new Error("No audio context created");
  return FakeAudioContext.last;
}

function audio() {
  const element = document.querySelector("audio");
  if (element === null) throw new Error("No audio element rendered");
  return element;
}

function Controls() {
  const song = useSong();
  return (
    <>
      <button type="button" onClick={() => song.play()}>
        Play
      </button>
      <button type="button" onClick={() => song.play(1000)}>
        Fade in
      </button>
      <button type="button" onClick={() => song.stop()}>
        Stop
      </button>
      <button type="button" onClick={() => song.stop(1000)}>
        Fade out
      </button>
      <p>{song.playing ? "playing" : "silent"}</p>
    </>
  );
}

function renderSong() {
  return render(
    <SongProvider>
      <Controls />
    </SongProvider>,
  );
}

async function startSong() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
  });
}

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => state });
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("SongProvider", () => {
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
    setVisibility("visible");
  });

  it("starts downloading the song as the page loads, without playing it", () => {
    renderSong();

    expect(fetchSong).toHaveBeenCalledWith(SONG_SRC, expect.anything());
    // Until the download lands, playing streams the song.
    expect(audio()).toHaveAttribute("src", SONG_SRC);
    expect(audio()).toHaveAttribute("preload", "none");
    expect(audio()).not.toHaveAttribute("controls");
    expect(play).not.toHaveBeenCalled();
  });

  it("plays the downloaded song so the music starts at once", async () => {
    renderSong();

    finishDownload();
    await waitFor(() => expect(audio()).toHaveAttribute("src", SONG_URL));
    expect(play).not.toHaveBeenCalled();
  });

  it("keeps streaming a song that started before the download finished", async () => {
    renderSong();
    await startSong();

    await act(async () => {
      finishDownload();
    });
    expect(audio()).toHaveAttribute("src", SONG_SRC);
  });

  it("releases the downloaded song when the page goes", async () => {
    const { unmount } = renderSong();
    finishDownload();
    await waitFor(() => expect(audio()).toHaveAttribute("src", SONG_URL));

    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(SONG_URL);
  });

  it("loops the song", () => {
    renderSong();
    expect(audio().loop).toBe(true);
  });

  it("stops and rewinds the song", async () => {
    renderSong();
    await startSong();
    audio().currentTime = 42;

    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(pause).toHaveBeenCalledTimes(1);
    expect(audio().currentTime).toBe(0);
    expect(screen.getByText("silent")).toBeInTheDocument();
  });

  it("pauses when the guest leaves for another tab or app, and stays paused on return", async () => {
    renderSong();
    await startSong();

    act(() => setVisibility("hidden"));
    expect(pause).toHaveBeenCalledTimes(1);
    expect(screen.getByText("silent")).toBeInTheDocument();

    act(() => setVisibility("visible"));
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("fades the song in from silence", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    renderSong();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Fade in" }));
    });
    expect(mixer().resume).toHaveBeenCalled();
    expect(mixer().gain.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
    // Rising steadily over the fade, to just under full volume.
    expect(mixer().ramps).toHaveLength(20);
    expect(mixer().ramps.every((v, i, all) => i === 0 || v > all[i - 1])).toBe(true);
    expect(mixer().ramps.at(-1)).toBeCloseTo(SONG_VOLUME);
    expect(mixer().gain.gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(
      expect.closeTo(SONG_VOLUME),
      1,
    );
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("starts the song just under full volume, so its loudest moments don't crackle", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    renderSong();
    await startSong();

    expect(SONG_VOLUME).toBeLessThan(0.9);
    expect(mixer().gain.gain.value).toBeCloseTo(SONG_VOLUME);
  });

  it("fades the song out, then stops and rewinds it", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("AudioContext", FakeAudioContext);
    renderSong();
    await startSong();
    audio().currentTime = 42;

    fireEvent.click(screen.getByRole("button", { name: "Fade out" }));
    expect(mixer().ramps.every((v, i, all) => i === 0 || v < all[i - 1])).toBe(true);
    expect(mixer().ramps.at(-1)).toBeCloseTo(0);
    expect(pause).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(pause).toHaveBeenCalledTimes(1);
    expect(audio().currentTime).toBe(0);
    vi.useRealTimers();
  });

  it("plays the song without fading where Web Audio is missing", async () => {
    renderSong();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Fade in" }));
    });
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("pauses when the guest leaves the page", async () => {
    renderSong();
    await startSong();

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(pause).toHaveBeenCalledTimes(1);
  });
});
