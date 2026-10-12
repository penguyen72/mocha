import { FOIL, WRITE_ON } from "./card-motion";
import {
  MAIL_EYEBROW,
  MAIL_NAMES,
  OPEN_PROMPT_CLICK,
  OPEN_PROMPT_TAP,
} from "./invitation-content";

type FadingProps = {
  /** True while the envelope opens: the sealed-envelope copy steps aside for the cards. */
  fading: boolean;
};

/** Inside the floral frame, clear of the top-left roses. */
const HEADER = "absolute inset-x-0 top-[25.5%] z-[8] flex flex-col items-center text-center";

const EYEBROW =
  "m-0 font-serif text-[calc(11.5*var(--std-u))] font-semibold uppercase leading-none " +
  "tracking-[0.34em] text-std-accent-ink [animation:var(--std-anim-mail-in)]";

const NAMES =
  `m-0 mt-[calc(4*var(--std-u))] font-script text-[calc(52*var(--std-u))] font-normal leading-[1.1] ${FOIL} ` +
  `${WRITE_ON} [animation:var(--std-anim-mail-write),var(--std-anim-foil)]`;

const SPRIG =
  "mt-[calc(2*var(--std-u))] block w-[calc(74*var(--std-u))] [animation:var(--std-anim-mail-sprig)]";

/** A rose bud between two hairlines, finishing the names once they have written on. */
function MailSprig() {
  return (
    <svg data-mail-sprig aria-hidden="true" viewBox="0 0 74 12" className={SPRIG}>
      <path d="M4 6 H30 M44 6 H70" fill="none" strokeWidth="0.8" className="stroke-std-hairline" />
      <path d="M37 1.5 C39.6 4 39.6 8 37 10.5 C34.4 8 34.4 4 37 1.5Z" className="fill-std-bud" />
      <circle cx="32.5" cy="6" r="1" className="fill-std-postmark-ink" />
      <circle cx="41.5" cy="6" r="1" className="fill-std-postmark-ink" />
    </svg>
  );
}

/**
 * "You have mail from Peyton & Liane", above the sealed envelope. The names write
 * themselves on as the page loads, in the same rose-pearl foil as the announcement card.
 */
export function MailHeader({ fading }: FadingProps) {
  return (
    <div className={fading ? `${HEADER} [animation:var(--std-anim-prompt-out)]` : HEADER}>
      <p className={EYEBROW}>{MAIL_EYEBROW}</p>
      <p className={NAMES}>{MAIL_NAMES}</p>
      <MailSprig />
    </div>
  );
}

const PROMPT =
  "pointer-events-none absolute inset-x-0 top-[73.5%] z-[8] m-0 flex items-center justify-center " +
  "gap-[calc(10*var(--std-u))] font-serif text-[calc(11*var(--std-u))] font-semibold uppercase " +
  "leading-none tracking-[0.28em] text-std-accent-ink " +
  "before:h-px before:w-[calc(22*var(--std-u))] before:bg-std-hairline before:content-[''] " +
  "after:h-px after:w-[calc(22*var(--std-u))] after:bg-std-hairline after:content-['']";

/** Below the envelope: "click" for a mouse, "tap" for a finger. */
export function OpenPrompt({ fading }: FadingProps) {
  return (
    <p
      aria-hidden
      className={
        fading
          ? `${PROMPT} [animation:var(--std-anim-prompt-out)]`
          : `${PROMPT} [animation:var(--std-anim-open-prompt-in)]`
      }
    >
      <span className="[@media(pointer:coarse)]:hidden">{OPEN_PROMPT_CLICK}</span>
      <span className="hidden [@media(pointer:coarse)]:inline">{OPEN_PROMPT_TAP}</span>
    </p>
  );
}
