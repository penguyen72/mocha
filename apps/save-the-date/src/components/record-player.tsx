"use client";

import { useId } from "react";

import {
  RECORD_HINT_PAUSE,
  RECORD_HINT_PLAY,
  RECORD_PAUSE_LABEL,
  RECORD_PLAY_LABEL,
} from "./invitation-content";
import { useSong } from "./song";

type RecordPlayerProps = {
  /** Complete positioning and entrance animation for the record, as a literal class string. */
  className: string;
  /** The invitation is opening: the record spins in and settles as it lands on the card. */
  animated: boolean;
};

/**
 * On a phone the record is only 30-33px across, so an invisible ring 8px wide around it
 * catches near-miss taps and brings the target to at least 44px.
 */
const RECORD_BUTTON =
  "relative block aspect-square w-full cursor-pointer rounded-full " +
  "before:absolute before:inset-[-8px] before:rounded-full before:content-[''] " +
  "[box-shadow:var(--std-record-shadow)] focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-std-focus-ring";

const DISC = "absolute inset-0 rounded-full [background:var(--std-record-vinyl)]";

/** The disc spins only once the song has started, and holds its angle while paused. */
const DISC_SPIN = "[animation:var(--std-anim-record-spin)]";

/** As the invitation opens, the disc arrives turning and slows to rest, as if just set down. */
const DISC_ARRIVE = "[animation:var(--std-anim-record-arrive)]";

/**
 * A vinyl record on the date card that turns with the couple's song. The song starts as the
 * envelope opens; the record is its only control, pausing and resuming it.
 */
export function RecordPlayer({ className, animated }: RecordPlayerProps) {
  const { playing, started, toggle } = useSong();
  const arcId = `record-arc-${useId().replace(/:/g, "")}`;

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
          className={started ? `${DISC} ${DISC_SPIN}` : animated ? `${DISC} ${DISC_ARRIVE}` : DISC}
          // Only the spin follows the song; pausing before the first tap would freeze the arrival.
          style={started ? { animationPlayState: playing ? "running" : "paused" } : undefined}
        >
          <span className="absolute inset-[26%] rounded-full border-[calc(0.6*var(--std-u))] border-std-accent-ink/35 bg-std-record-label" />
        </span>
        <span
          aria-hidden
          className="absolute inset-[35%] grid place-items-center rounded-full bg-std-record-button"
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
    </div>
  );
}
