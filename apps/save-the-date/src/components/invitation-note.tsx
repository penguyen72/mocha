import { useEffect, useId, useRef, useState } from "react";

import { Countdown } from "./countdown";
import {
  CALENDAR_HREF,
  CALENDAR_LABEL,
  GOOGLE_CALENDAR_HREF,
  NOTE_TEXT,
  REPLAY_LABEL,
} from "./invitation-content";

type InvitationNoteProps = {
  animated: boolean;
  /** Reseals the envelope so the invitation can be opened again. */
  onReplay: () => void;
};

const NOTE =
  "absolute left-0 right-0 top-[75.5%] z-[8] flex flex-col items-center " +
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

const CALENDAR_OPTION =
  "flex min-h-11 items-center rounded px-3 py-2 font-sans text-sm font-medium " +
  "text-std-accent-ink hover:bg-std-blush-card focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-std-focus-ring";

export function InvitationNote({ animated, onReplay }: InvitationNoteProps) {
  // Build the subscription URL when opening, so it uses the current deployment's
  // host and port without reading window during server rendering or hydration.
  const [appleHref, setAppleHref] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarButtonRef = useRef<HTMLButtonElement>(null);
  const calendarId = useId();
  const appleDescriptionId = useId();
  const calendarOpen = appleHref !== null;

  useEffect(() => {
    if (!calendarOpen) return;
    const dismissOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !calendarRef.current?.contains(event.target)) {
        setAppleHref(null);
      }
    };
    document.addEventListener("pointerdown", dismissOutside);
    return () => document.removeEventListener("pointerdown", dismissOutside);
  }, [calendarOpen]);

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
        <div className="relative flex items-center gap-[calc(10*var(--std-u))]">
          <div
            ref={calendarRef}
            className="contents"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setAppleHref(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape" && calendarOpen) {
                event.stopPropagation();
                setAppleHref(null);
                calendarButtonRef.current?.focus();
              }
            }}
          >
            <button
              ref={calendarButtonRef}
              type="button"
              className={ACTION}
              aria-expanded={calendarOpen}
              aria-controls={calendarId}
              onClick={() => {
                if (calendarOpen) {
                  setAppleHref(null);
                } else {
                  const url = new URL(CALENDAR_HREF, window.location.href);
                  setAppleHref(`webcal://${url.host}${url.pathname}`);
                }
              }}
            >
              {CALENDAR_LABEL}
            </button>
            {calendarOpen && (
              <div
                id={calendarId}
                role="group"
                aria-label="Choose a calendar"
                className="absolute bottom-full left-1/2 mb-2 w-72 max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-xl border border-std-liner-rule bg-std-stage p-3 [box-shadow:var(--std-announce-shadow)]"
              >
                <a
                  href={GOOGLE_CALENDAR_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={CALENDAR_OPTION}
                >
                  Google Calendar
                </a>
                <a href={appleHref} aria-describedby={appleDescriptionId} className={CALENDAR_OPTION}>
                  Apple Calendar
                </a>
                <p id={appleDescriptionId} className="m-0 px-3 pb-2 font-sans text-xs leading-relaxed text-std-note-ink">
                  Adds a subscribed calendar with the wedding date.
                </p>
                <a href={CALENDAR_HREF} download="peyton-and-liane.ics" className={CALENDAR_OPTION}>
                  Download calendar file
                </a>
              </div>
            )}
          </div>
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
