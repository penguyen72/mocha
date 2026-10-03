/**
 * Shared class fragments for the invitation's cards. Each is a complete literal string,
 * because Tailwind cannot see a constructed one.
 */

/** Writes a line on from left to right with a soft ink-wipe; pair with a write animation. */
export const WRITE_ON =
  "[mask-image:var(--std-write-mask)] [mask-size:250%_100%] [mask-repeat:no-repeat] [mask-position:0_0]";

/**
 * Rose-pearl foil text. The padding gives script swashes room inside the painted box —
 * background-clip: text only paints glyphs that fall within the element's box.
 */
export const FOIL =
  "w-fit px-[0.2em] py-[0.12em] -my-[0.12em] bg-clip-text text-transparent " +
  "[background-image:var(--std-foil)] [background-size:300%_100%] [background-position:100%_0]";

/** Holds a card's floral sprig back until the card is out of the envelope. */
export const SPRIG_IN = "[animation:var(--std-anim-sprig-in)]";

/** Pointer parallax: each card follows the stage's --std-tilt-* by its own depth. */
export const PARALLAX_NEAR =
  "[translate:calc(var(--std-tilt-x,0)*7*var(--std-u))_calc(var(--std-tilt-y,0)*6*var(--std-u))] [transition:var(--std-parallax-transition)]";
export const PARALLAX_MID =
  "[translate:calc(var(--std-tilt-x,0)*5*var(--std-u))_calc(var(--std-tilt-y,0)*4*var(--std-u))] [transition:var(--std-parallax-transition)]";
export const PARALLAX_FAR =
  "[translate:calc(var(--std-tilt-x,0)*3*var(--std-u))_calc(var(--std-tilt-y,0)*2.5*var(--std-u))] [transition:var(--std-parallax-transition)]";
