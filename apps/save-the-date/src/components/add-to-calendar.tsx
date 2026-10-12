import { useId, useRef, type ReactNode } from "react";

import {
  CALENDAR_CHOICES,
  CALENDAR_DISMISS,
  CALENDAR_FILE_NAME,
  CALENDAR_HREF,
  CALENDAR_LABEL,
  CALENDAR_SHEET_DATE,
  CALENDAR_SHEET_PLACE,
  CALENDAR_SHEET_TITLE,
  CALENDAR_TILE_MONTH,
  DATE_CARD_DAY,
  GOOGLE_CALENDAR_HREF,
} from "./invitation-content";

type AddToCalendarProps = {
  /** Styles the trigger like its neighbouring links. */
  className?: string;
};

/*
 * A modal <dialog> sits in the top layer, outside the scaled invitation stage, so it is
 * sized in real pixels rather than --std-u. Phones get a sheet pinned to the bottom edge;
 * wider screens get the same sheet centred as a dialog.
 */
const SHEET =
  "m-auto w-[372px] max-w-[calc(100vw-32px)] overflow-visible rounded-2xl border-0 bg-std-stage p-0 " +
  "font-sans text-std-note-ink [box-shadow:var(--std-sheet-shadow)] [animation:var(--std-anim-dialog-in)] " +
  "backdrop:bg-[var(--std-sheet-backdrop)] backdrop:[animation:var(--std-anim-backdrop-in)] " +
  "max-sm:mb-0 max-sm:w-full max-sm:max-w-full max-sm:rounded-b-none max-sm:[animation:var(--std-anim-sheet-up)]";

const PANEL = "px-4 pt-4 pb-3 max-sm:pb-[max(12px,env(safe-area-inset-bottom))]";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-std-focus-ring";

const ROW = `flex min-h-14 items-center gap-3 rounded-lg px-2 py-2 text-left no-underline hover:bg-std-blush-card ${FOCUS}`;

const ICON =
  "grid size-8 flex-none place-items-center rounded-full bg-std-blush-card text-std-accent-ink " +
  "[&>svg]:size-4 [&>svg]:fill-none [&>svg]:stroke-current [&>svg]:stroke-[1.5] " +
  "[&>svg]:[stroke-linecap:round] [&>svg]:[stroke-linejoin:round]";

/* Simple monoline glyphs in the invitation's ink, not the providers' own artwork. */
const GOOGLE_ICON = (
  <svg viewBox="0 0 16 16" aria-hidden>
    <path d="M12.4 4.6A5.5 5.5 0 1 0 13.5 8H8.5" />
  </svg>
);
const APPLE_ICON = (
  <svg viewBox="0 0 16 16" aria-hidden>
    <path d="M10.6 1.6c.1 1-.3 1.9-.9 2.5-.6.7-1.5 1.1-2.3 1-.1-.9.3-1.9.9-2.5.6-.6 1.6-1 2.3-1z" />
    <path d="M12.9 11.1c-.4.9-.6 1.3-1.1 2-.7 1-1.6 2.2-2.8 2.2-1 0-1.3-.7-2.7-.7s-1.7.7-2.7.7C2.5 15.3 1.6 14.2 1 13.2-.7 10.6-.9 7.5.2 5.9 1 4.7 2.2 4 3.4 4c1.2 0 1.9.7 2.9.7S8 4 9.4 4c1 0 2.1.6 2.9 1.5-2.5 1.4-2.1 4.9.6 5.6z" />
  </svg>
);
const FILE_ICON = (
  <svg viewBox="0 0 16 16" aria-hidden>
    <path d="M8 2v8M4.6 7 8 10.4 11.4 7M2.5 13.5h11" />
  </svg>
);

function Choice({
  icon,
  choice,
  onChoose,
  ...link
}: {
  icon: ReactNode;
  choice: (typeof CALENDAR_CHOICES)[keyof typeof CALENDAR_CHOICES];
  onChoose: () => void;
  href: string;
  target?: string;
  rel?: string;
  download?: string;
}) {
  return (
    <li>
      <a {...link} onClick={onChoose} className={ROW}>
        <span className={ICON}>{icon}</span>
        <span>
          <span className="block text-[15px] font-medium text-std-accent-ink">{choice.name}</span>
          <span className="block text-xs text-muted">{choice.hint}</span>
        </span>
      </a>
    </li>
  );
}

export function AddToCalendar({ className }: AddToCalendarProps) {
  const sheetRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const close = () => sheetRef.current?.close();

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={className}
        aria-haspopup="dialog"
        onClick={() => sheetRef.current?.showModal()}
      >
        {CALENDAR_LABEL}
      </button>
      <dialog
        ref={sheetRef}
        aria-labelledby={titleId}
        className={SHEET}
        // A click on the ::backdrop lands on the <dialog> itself; the panel fills the rest.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onClose={() => triggerRef.current?.focus()}
      >
        <div className={PANEL}>
          <div className="flex items-center gap-3 border-b border-std-sheet-rule px-1 pb-3">
            <div
              aria-hidden
              className="flex h-12 w-11 flex-none flex-col items-center justify-center rounded-md bg-std-date-card text-std-date-ink"
            >
              <span className="text-[8px] uppercase tracking-[0.2em]">{CALENDAR_TILE_MONTH}</span>
              <span className="font-serif text-2xl leading-none font-semibold">{DATE_CARD_DAY}</span>
            </div>
            <div>
              <h2 id={titleId} className="m-0 font-serif text-lg leading-tight font-semibold">
                {CALENDAR_SHEET_TITLE}
              </h2>
              {/* If the line wraps, it breaks between the date and the place. */}
              <p className="m-0 mt-0.5 text-xs text-muted">
                <span className="whitespace-nowrap">{CALENDAR_SHEET_DATE} ·</span>{" "}
                <span className="whitespace-nowrap">{CALENDAR_SHEET_PLACE}</span>
              </p>
            </div>
          </div>

          <ul className="m-0 mt-1 list-none divide-y divide-std-sheet-rule p-0">
            <Choice
              icon={GOOGLE_ICON}
              choice={CALENDAR_CHOICES.google}
              onChoose={close}
              href={GOOGLE_CALENDAR_HREF}
              target="_blank"
              rel="noopener noreferrer"
            />
            <Choice icon={APPLE_ICON} choice={CALENDAR_CHOICES.apple} onChoose={close} href={CALENDAR_HREF} />
            <Choice
              icon={FILE_ICON}
              choice={CALENDAR_CHOICES.file}
              onChoose={close}
              href={CALENDAR_HREF}
              download={CALENDAR_FILE_NAME}
            />
          </ul>

          <button
            type="button"
            onClick={close}
            className={`mx-auto mt-1 flex min-h-11 cursor-pointer items-center border-0 bg-transparent px-4 text-[11px] font-medium uppercase tracking-[0.2em] text-std-accent-ink hover:text-std-link-hover ${FOCUS}`}
          >
            {CALENDAR_DISMISS}
          </button>
        </div>
      </dialog>
    </>
  );
}
