"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  MUSIC_PLAYER_CLOSE_LABEL,
  MUSIC_PLAYER_LABEL,
  RECORD_HINT_PAUSE,
  RECORD_HINT_PLAY,
  RECORD_PAUSE_LABEL,
  RECORD_PLAY_LABEL,
  SONG_ARTIST,
  SONG_TITLE,
  SONG_VIDEO_ID,
} from "./invitation-content";
import { loadYouTubeApi, type YouTubePlayer } from "./youtube-api";

type RecordPlayerProps = {
  /** Complete positioning and entrance animation for the record, as a literal class string. */
  className: string;
};

/** YouTube requires an embedded player of at least 200 x 200 px, with nothing drawn over it. */
const PLAYER_HEIGHT = "200";

const RECORD_BUTTON =
  "relative block aspect-square w-full cursor-pointer rounded-full " +
  "[box-shadow:var(--std-record-shadow)] focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-std-focus-ring";

const DISC = "absolute inset-0 rounded-full [background:var(--std-record-vinyl)]";

/** The disc spins only once the song has started, and holds its angle while paused. */
const DISC_SPIN = "[animation:var(--std-anim-record-spin)]";

const PANEL =
  "fixed bottom-[calc(16px+env(safe-area-inset-bottom,0px))] left-4 z-50 " +
  "w-[min(320px,calc(100vw-32px))] rounded-xl border border-std-lace-line bg-std-stage p-3 " +
  "[box-shadow:var(--std-player-shadow)] [animation:var(--std-anim-player-in)]";

/**
 * A vinyl record on the date card that plays the couple's song. YouTube's policies require
 * the video to stay visible while it plays, so the first tap opens a small player panel; the
 * record then follows YouTube's own state, whichever control the guest uses.
 */
export function RecordPlayer({ className }: RecordPlayerProps) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [mount, setMount] = useState<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const arcId = `record-arc-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    if (!open || mount === null) return;

    let cancelled = false;
    let player: YouTubePlayer | null = null;
    // YouTube swaps the element it is given for its iframe, so give it one React does not own.
    const target = document.createElement("div");
    mount.append(target);

    loadYouTubeApi().then(
      (YT) => {
        if (cancelled) return;
        player = new YT.Player(target, {
          host: "https://www.youtube-nocookie.com",
          videoId: SONG_VIDEO_ID,
          width: "100%",
          height: PLAYER_HEIGHT,
          playerVars: { autoplay: 1, playsinline: 1, rel: 0 },
          events: {
            onReady: (event) => event.target.playVideo(),
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.PLAYING) setPlaying(true);
              else if (event.data === YT.PlayerState.PAUSED) setPlaying(false);
              else if (event.data === YT.PlayerState.ENDED) {
                event.target.seekTo(0, true);
                event.target.playVideo();
              }
            },
          },
        });
        playerRef.current = player;
      },
      () => {
        if (!cancelled) setOpen(false);
      },
    );

    return () => {
      cancelled = true;
      player?.destroy();
      playerRef.current = null;
      target.remove();
    };
  }, [open, mount]);

  function toggle() {
    if (!open) {
      setOpen(true);
      return;
    }
    if (playing) playerRef.current?.pauseVideo();
    else playerRef.current?.playVideo();
  }

  function close() {
    setOpen(false);
    setPlaying(false);
  }

  return (
    <div className={className}>
      <button
        type="button"
        aria-label={playing ? RECORD_PAUSE_LABEL : RECORD_PLAY_LABEL}
        onClick={toggle}
        className={RECORD_BUTTON}
      >
        <span
          aria-hidden
          className={open ? `${DISC} ${DISC_SPIN}` : DISC}
          style={{ animationPlayState: playing ? "running" : "paused" }}
        >
          <span className="absolute inset-[26%] rounded-full border-[calc(0.6*var(--std-u))] border-std-accent-ink/35 bg-std-record-label" />
        </span>
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 grid size-[30%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-std-record-button"
        >
          <svg viewBox="0 0 12 12" className="size-[46%] fill-std-date-ink">
            {playing ? (
              <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />
            ) : (
              <path d="M3 1.2 10.5 6 3 10.8z" />
            )}
          </svg>
        </span>
      </button>

      {/* The hint follows a circle just outside the rim (r 64 on the record's 100-unit box),
          centred on its south-east side and reading clockwise up toward the east. */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      >
        <path id={arcId} d="M13.29 102.43 A 64 64 0 0 0 102.43 13.29" fill="none" />
        <text className="fill-std-accent-ink font-sans text-[9.5px] font-semibold uppercase tracking-[0.2em]">
          <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
            {playing ? RECORD_HINT_PAUSE : RECORD_HINT_PLAY}
          </textPath>
        </text>
      </svg>

      {open &&
        createPortal(
          <section aria-label={MUSIC_PLAYER_LABEL} className={PANEL}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="min-w-0 leading-tight">
                <span className="block font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-std-accent-ink">
                  {MUSIC_PLAYER_LABEL}
                </span>
                <span className="block truncate font-serif text-[17px] font-semibold text-std-date-ink">
                  {SONG_TITLE} · {SONG_ARTIST}
                </span>
              </p>
              <button
                type="button"
                aria-label={MUSIC_PLAYER_CLOSE_LABEL}
                onClick={close}
                className="grid size-8 flex-none cursor-pointer place-items-center rounded-full text-std-date-ink hover:bg-std-blush-card focus-visible:outline-2 focus-visible:outline-std-focus-ring"
              >
                <svg aria-hidden viewBox="0 0 12 12" className="size-3 stroke-current" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 2l8 8M10 2l-8 8" />
                </svg>
              </button>
            </div>
            <div ref={setMount} className="h-[200px] w-full overflow-hidden rounded-md bg-std-date-ink" />
          </section>,
          document.body,
        )}
    </div>
  );
}
