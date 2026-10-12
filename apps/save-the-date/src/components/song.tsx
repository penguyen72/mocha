"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { SONG_SRC } from "./invitation-content";

type Song = {
  /** The song is playing now. */
  playing: boolean;
  /** The song has played, so the record turns with it (and holds its angle while paused). */
  started: boolean;
  /**
   * Starts the song, rising from silence over `fadeMs`. Call it straight from a tap: browsers
   * only allow sound after a gesture.
   */
  play: (fadeMs?: number) => void;
  /** Plays a paused song, or pauses a playing one. */
  toggle: () => void;
  /**
   * Fades the song to silence over `fadeMs`, then stops and rewinds it, ready to start over
   * when the envelope opens again.
   */
  stop: (fadeMs?: number) => void;
};

/**
 * How loud the song is through a fade, as volume points every 50ms. The points follow an
 * equal-power curve, so the song neither lingers near silence nor drops away at the end.
 */
function fadeCurve(from: number, to: number, fadeMs: number) {
  const steps = Math.max(1, Math.round(fadeMs / 50));
  return Array.from({ length: steps }, (_, index) => {
    const t = (index + 1) / steps;
    const eased = to > from ? Math.sin((t * Math.PI) / 2) : 1 - Math.cos((t * Math.PI) / 2);
    return { at: (t * fadeMs) / 1000, volume: from + (to - from) * eased };
  });
}

type Mixer = { context: AudioContext; gain: GainNode };

/**
 * Routes the song through a volume control that can fade. An iPhone ignores an audio
 * element's own volume, so only Web Audio can fade it there. Created on the first tap,
 * since browsers only start audio from a gesture.
 */
function connectMixer(audio: HTMLAudioElement): Mixer | null {
  if (typeof AudioContext !== "function") return null;
  try {
    // Web Audio follows an iPhone's silent switch; the song should play through it, as a
    // plain audio element does.
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session !== undefined) session.type = "playback";

    const context = new AudioContext();
    const gain = context.createGain();
    context.createMediaElementSource(audio).connect(gain).connect(context.destination);
    return { context, gain };
  } catch {
    return null;
  }
}

/**
 * How loud the song plays, just under full volume. The recording is mastered so hot that its
 * loudest moments decode past full scale; Web Audio clips those, which a phone plays as
 * crackle. This leaves them room.
 */
export const SONG_VOLUME = 0.85;

/** The song rises in over the first half of the envelope opening. */
export const SONG_FADE_IN_MS = 2500;

/** With the closing choreography skipped, the song still fades out rather than cutting off. */
export const SONG_FADE_OUT_MS = 1500;

const SongContext = createContext<Song | null>(null);

export function useSong() {
  const song = useContext(SongContext);
  if (song === null) throw new Error("useSong must be used inside a SongProvider");
  return song;
}

/**
 * The couple's song, on a loop. It lives above the envelope rather than on the record so the
 * tap that opens the envelope can start it: the record only appears once the envelope opens,
 * too late to count as the tap browsers ask for. The record pauses and resumes it.
 */
export function SongProvider({ children }: { children: ReactNode }) {
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [songSrc, setSongSrc] = useState(SONG_SRC);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mixerRef = useRef<Mixer | null | undefined>(undefined);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A phone only starts fetching a streamed song once it is asked to play, which held the
  // music back by about a second. Download it while the guest looks at the envelope instead,
  // and play it from memory. A tap before the download lands still streams the song.
  useEffect(() => {
    const download = new AbortController();
    let downloadedSrc: string | null = null;

    fetch(SONG_SRC, { signal: download.signal })
      .then((response) => (response.ok ? response.blob() : null))
      .then((song) => {
        const audio = audioRef.current;
        // Swapping the source would cut off a song that is already playing or paused mid-way.
        if (song === null || audio === null || !audio.paused || audio.currentTime > 0) return;
        downloadedSrc = URL.createObjectURL(song);
        setSongSrc(downloadedSrc);
      })
      .catch(() => {});

    return () => {
      download.abort();
      if (downloadedSrc !== null) URL.revokeObjectURL(downloadedSrc);
    };
  }, []);

  // Leaving the invitation (another tab, another app, or away from the page) stops the music.
  // It stays paused on return; the record starts it again.
  useEffect(() => {
    const pauseIfHidden = () => {
      if (document.visibilityState === "hidden") audioRef.current?.pause();
    };
    const pause = () => audioRef.current?.pause();

    document.addEventListener("visibilitychange", pauseIfHidden);
    window.addEventListener("pagehide", pause);
    return () => {
      document.removeEventListener("visibilitychange", pauseIfHidden);
      window.removeEventListener("pagehide", pause);
    };
  }, []);

  /** Moves the volume from `from` to `to` over `fadeMs`, replacing any fade under way. */
  const fadeTo = useCallback((from: number, to: number, fadeMs: number) => {
    const mixer = mixerRef.current;
    if (!mixer) return;
    const { context, gain } = mixer;
    const now = context.currentTime;
    // Straight ramps between the curve's points, unlike one value curve, can replace a fade
    // part-way through in every browser.
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(from, now);
    if (fadeMs <= 0) {
      gain.gain.setValueAtTime(to, now);
      return;
    }
    for (const point of fadeCurve(from, to, fadeMs)) {
      gain.gain.linearRampToValueAtTime(point.volume, now + point.at);
    }
  }, []);

  /** How loud the song is right now, part-way through a fade or not. */
  const volume = useCallback(() => mixerRef.current?.gain.gain.value ?? 1, []);

  const cancelStop = useCallback(() => {
    if (stopTimerRef.current === null) return;
    clearTimeout(stopTimerRef.current);
    stopTimerRef.current = null;
  }, []);

  const play = useCallback(
    (fadeMs = 0) => {
      const audio = audioRef.current;
      if (audio === null) return;
      cancelStop();
      if (mixerRef.current === undefined) mixerRef.current = connectMixer(audio);
      // A phone suspends Web Audio in the background; a tap brings it back.
      mixerRef.current?.context.resume().catch(() => {});
      // A song starting over rises from silence; one fading out comes back from where it is.
      fadeTo(audio.paused && fadeMs > 0 ? 0 : volume(), SONG_VOLUME, fadeMs);
      audio.play()?.catch(() => setPlaying(false));
    },
    [cancelStop, fadeTo, volume],
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (audio === null) return;
    if (audio.paused) play();
    else audio.pause();
  }, [play]);

  const stop = useCallback(
    (fadeMs = 0) => {
      cancelStop();
      fadeTo(volume(), 0, fadeMs);
      const silence = () => {
        stopTimerRef.current = null;
        const audio = audioRef.current;
        if (audio === null) return;
        audio.pause();
        audio.currentTime = 0;
      };
      if (fadeMs > 0) stopTimerRef.current = setTimeout(silence, fadeMs);
      else silence();
    },
    [cancelStop, fadeTo, volume],
  );

  useEffect(
    () => () => {
      cancelStop();
      mixerRef.current?.context.close().catch(() => {});
    },
    [cancelStop],
  );

  const song = useMemo(
    () => ({ playing, started, play, toggle, stop }),
    [playing, started, play, toggle, stop],
  );

  return (
    <SongContext.Provider value={song}>
      {children}
      {/* The song downloads separately (above), so the element itself must not fetch it too. */}
      <audio
        ref={audioRef}
        src={songSrc}
        preload="none"
        loop
        onPlay={() => {
          setStarted(true);
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
      />
    </SongContext.Provider>
  );
}
