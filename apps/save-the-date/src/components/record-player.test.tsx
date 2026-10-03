import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  MUSIC_PLAYER_CLOSE_LABEL,
  MUSIC_PLAYER_LABEL,
  RECORD_HINT_PAUSE,
  RECORD_HINT_PLAY,
  RECORD_PAUSE_LABEL,
  RECORD_PLAY_LABEL,
  SONG_VIDEO_ID,
} from "./invitation-content";
import { RecordPlayer } from "./record-player";
import type { YouTubePlayerOptions } from "./youtube-api";

const STATE = { ENDED: 0, PLAYING: 1, PAUSED: 2 };

const player = {
  playVideo: vi.fn(),
  pauseVideo: vi.fn(),
  seekTo: vi.fn(),
  destroy: vi.fn(),
};
let options: YouTubePlayerOptions | undefined;
const loadYouTubeApi = vi.fn();

vi.mock("./youtube-api", () => ({ loadYouTubeApi: () => loadYouTubeApi() }));

function FakePlayer(_element: HTMLElement, playerOptions: YouTubePlayerOptions) {
  options = playerOptions;
  return player;
}

/** Taps the record and lets the mocked API load resolve. */
async function tapToStart() {
  fireEvent.click(screen.getByRole("button", { name: RECORD_PLAY_LABEL }));
  await act(async () => {});
}

function report(state: number) {
  act(() => options?.events.onStateChange?.({ data: state, target: player }));
}

describe("RecordPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    options = undefined;
    loadYouTubeApi.mockResolvedValue({ Player: FakePlayer, PlayerState: STATE });
  });

  it("waits for a tap before loading anything from YouTube", () => {
    render(<RecordPlayer className="" />);
    expect(screen.getByRole("button", { name: RECORD_PLAY_LABEL })).toBeInTheDocument();
    expect(screen.getByText(RECORD_HINT_PLAY)).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: MUSIC_PLAYER_LABEL })).not.toBeInTheDocument();
    expect(loadYouTubeApi).not.toHaveBeenCalled();
  });

  it("opens a visible player for the song on the privacy-enhanced host and starts it", async () => {
    render(<RecordPlayer className="" />);
    await tapToStart();

    expect(screen.getByRole("region", { name: MUSIC_PLAYER_LABEL })).toBeInTheDocument();
    expect(options?.videoId).toBe(SONG_VIDEO_ID);
    expect(options?.host).toBe("https://www.youtube-nocookie.com");
    expect(options?.height).toBe("200");

    act(() => options?.events.onReady?.({ target: player }));
    expect(player.playVideo).toHaveBeenCalledTimes(1);
  });

  it("follows YouTube's state and toggles playback from the record", async () => {
    render(<RecordPlayer className="" />);
    await tapToStart();

    report(STATE.PLAYING);
    const record = screen.getByRole("button", { name: RECORD_PAUSE_LABEL });
    expect(screen.getByText(RECORD_HINT_PAUSE)).toBeInTheDocument();

    fireEvent.click(record);
    expect(player.pauseVideo).toHaveBeenCalledTimes(1);

    report(STATE.PAUSED);
    fireEvent.click(screen.getByRole("button", { name: RECORD_PLAY_LABEL }));
    expect(player.playVideo).toHaveBeenCalledTimes(1);
  });

  it("loops the song when it ends", async () => {
    render(<RecordPlayer className="" />);
    await tapToStart();

    report(STATE.ENDED);
    expect(player.seekTo).toHaveBeenCalledWith(0, true);
    expect(player.playVideo).toHaveBeenCalledTimes(1);
  });

  it("closes the player and tears it down", async () => {
    render(<RecordPlayer className="" />);
    await tapToStart();
    report(STATE.PLAYING);

    fireEvent.click(screen.getByRole("button", { name: MUSIC_PLAYER_CLOSE_LABEL }));

    expect(player.destroy).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("region", { name: MUSIC_PLAYER_LABEL })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: RECORD_PLAY_LABEL })).toBeInTheDocument();
  });

  it("closes the panel again if YouTube cannot be reached", async () => {
    loadYouTubeApi.mockRejectedValue(new Error("offline"));
    render(<RecordPlayer className="" />);
    await tapToStart();

    expect(screen.queryByRole("region", { name: MUSIC_PLAYER_LABEL })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: RECORD_PLAY_LABEL })).toBeInTheDocument();
  });
});
