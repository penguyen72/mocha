/**
 * The slice of YouTube's IFrame Player API the record player uses. The full API is loaded from
 * YouTube at runtime, so these types are hand-written rather than installed.
 * https://developers.google.com/youtube/iframe_api_reference
 */
export type YouTubePlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  destroy(): void;
};

export type YouTubePlayerOptions = {
  host: string;
  videoId: string;
  width: string;
  height: string;
  playerVars: Record<string, number | string>;
  events: {
    onReady?: (event: { target: YouTubePlayer }) => void;
    onStateChange?: (event: { data: number; target: YouTubePlayer }) => void;
  };
};

export type YouTubeNamespace = {
  Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
};

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const API_SRC = "https://www.youtube.com/iframe_api";

let pending: Promise<YouTubeNamespace> | null = null;

/**
 * Loads the IFrame API on first use only, so nothing from YouTube reaches the page until a
 * guest asks for the song. Every caller shares one script and one promise.
 */
export function loadYouTubeApi(): Promise<YouTubeNamespace> {
  // YouTube's bootstrap script defines window.YT before Player exists, so wait for Player.
  if (window.YT?.Player) return Promise.resolve(window.YT);

  pending ??= new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (window.YT) resolve(window.YT);
    };

    const script = document.createElement("script");
    script.src = API_SRC;
    script.async = true;
    script.addEventListener("error", () => {
      pending = null;
      script.remove();
      reject(new Error("The YouTube IFrame API failed to load."));
    });
    document.head.append(script);
  });

  return pending;
}
