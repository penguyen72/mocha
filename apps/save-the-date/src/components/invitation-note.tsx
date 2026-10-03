import { Countdown } from "./countdown";
import {
  CALENDAR_HREF,
  CALENDAR_LABEL,
  NOTE_TEXT,
  REPLAY_LABEL,
} from "./invitation-content";

type InvitationNoteProps = {
  animated: boolean;
  /** Reseals the envelope so the invitation can be opened again. */
  onReplay: () => void;
};

const NOTE =
  "absolute left-0 right-0 top-[75.5%] z-[6] flex flex-col items-center " +
  "gap-[calc(22*var(--std-u))]";

const LINE = "flex items-center justify-center gap-[calc(12*var(--std-u))]";

const EXTRAS = "flex flex-col items-center gap-[calc(15*var(--std-u))]";

const RULE = "h-px w-[calc(28*var(--std-u))] bg-std-liner-rule";

const ACTION =
  "inline-flex min-h-11 cursor-pointer items-center border-none bg-transparent px-2 py-0 " +
  "font-sans text-[calc(9.5*var(--std-u))] font-medium uppercase tracking-[0.2em] text-std-accent-ink " +
  "underline decoration-std-liner-rule decoration-1 underline-offset-[6px] " +
  "hover:text-std-link-hover focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-std-focus-ring";

export function InvitationNote({ animated, onReplay }: InvitationNoteProps) {
  return (
    <div className={NOTE}>
      <div className={animated ? `${LINE} [animation:var(--std-anim-note-in)]` : LINE}>
        <span aria-hidden className={RULE} />
        <p className="m-0 text-center font-serif text-[calc(17*var(--std-u))] font-medium tracking-[0.06em] text-std-note-ink">
          {NOTE_TEXT}
        </p>
        <span aria-hidden className={RULE} />
      </div>

      <div className={animated ? `${EXTRAS} [animation:var(--std-anim-extras-in)]` : EXTRAS}>
        <Countdown />
        <div className="flex items-center gap-[calc(10*var(--std-u))]">
          <a href={CALENDAR_HREF} className={ACTION}>
            {CALENDAR_LABEL}
          </a>
          <span aria-hidden className="text-std-liner-rule">
            ·
          </span>
          <button type="button" onClick={onReplay} className={ACTION}>
            {REPLAY_LABEL}
          </button>
        </div>
      </div>
    </div>
  );
}
