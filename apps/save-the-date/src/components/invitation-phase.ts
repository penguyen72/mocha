export type InvitationPhase = "closed" | "opening" | "open" | "closing";

/**
 * How long the opening choreography runs, in milliseconds.
 *
 * This mirrors the @keyframes timeline in src/app/globals.css: the last one-shot
 * animation, --std-anim-extras-in, starts at 4550ms and runs for 420ms. Change one and
 * you must change the other. The ambient loops (float, foil, falling petals)
 * never end and are not counted.
 */
export const OPENING_DURATION_MS = 4970;

/**
 * How long resealing the envelope runs, in milliseconds.
 *
 * This mirrors the closing @keyframes timeline in src/app/globals.css: the last one-shot
 * animation, --std-anim-reseal-sparkle, starts at 2280ms and runs for 600ms. Change one and
 * you must change the other.
 */
export const CLOSING_DURATION_MS = 2880;
