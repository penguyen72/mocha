export type InvitationPhase = "closed" | "opening" | "open";

/**
 * How long the opening choreography runs, in milliseconds.
 *
 * This mirrors the @keyframes timeline in src/app/globals.css: the last petal starts at
 * 3792ms and runs for 832ms. Change one and you must change the other.
 */
export const OPENING_DURATION_MS = 4624;
