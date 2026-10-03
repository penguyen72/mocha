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

const HEADER = "absolute inset-x-0 top-[17%] z-[8] flex flex-col items-center text-center";

const EYEBROW =
  "m-0 font-serif text-[calc(13*var(--std-u))] font-semibold uppercase leading-none " +
  "tracking-[0.24em] text-std-note-ink [animation:var(--std-anim-mail-in)]";

const NAMES =
  `m-0 mt-[calc(4*var(--std-u))] font-script text-[calc(50*var(--std-u))] font-normal leading-[1.1] ${FOIL} ` +
  `${WRITE_ON} [animation:var(--std-anim-mail-write),var(--std-anim-foil)]`;

/**
 * "You have mail from Peyton & Liane", above the sealed envelope. The names write
 * themselves on as the page loads, in the same rose-pearl foil as the announcement card.
 */
export function MailHeader({ fading }: FadingProps) {
  return (
    <div className={fading ? `${HEADER} [animation:var(--std-anim-prompt-out)]` : HEADER}>
      <p className={EYEBROW}>{MAIL_EYEBROW}</p>
      <p className={NAMES}>{MAIL_NAMES}</p>
    </div>
  );
}

const PROMPT =
  "pointer-events-none absolute inset-x-0 top-[74%] z-[8] m-0 text-center font-serif " +
  "text-[calc(11.5*var(--std-u))] font-semibold uppercase leading-none tracking-[0.24em] " +
  "text-std-accent-ink";

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
