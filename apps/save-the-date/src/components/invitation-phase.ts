export type InvitationPhase = "closed" | "opening" | "open";

/**
 * How long the opening choreography runs, in milliseconds.
 *
 * This mirrors the @keyframes timeline in src/app/globals.css: the last one-shot
 * animation, --std-anim-extras-in, starts at 4550ms and runs for 420ms. Change one and
 * you must change the other. The ambient loops (float, sheen, foil, sway, falling petals)
 * never end and are not counted.
 */
export const OPENING_DURATION_MS = 4970;
