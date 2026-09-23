import Link from "next/link";

import { NOTE_CTA_HREF, NOTE_CTA_LABEL, NOTE_LINE_1, NOTE_LINE_2 } from "./invitation-content";

type InvitationNoteProps = {
  animated: boolean;
};

const NOTE =
  "absolute left-0 right-0 top-[75.6%] z-[6] flex flex-col items-center " +
  "gap-[calc(36*var(--std-u))]";

const NOTE_ANIMATION = "[animation:var(--std-anim-note-in)]";

export function InvitationNote({ animated }: InvitationNoteProps) {
  return (
    <div className={animated ? `${NOTE} ${NOTE_ANIMATION}` : NOTE}>
      <p className="m-0 text-center font-serif text-[calc(12.5*var(--std-u))] leading-[1.35] tracking-[0.09em] text-std-note-ink">
        <span className="block">{NOTE_LINE_1}</span>
        <span className="block">{NOTE_LINE_2}</span>
      </p>

      <Link
        href={NOTE_CTA_HREF}
        className="flex min-h-11 min-w-11 items-center rounded-[4px] px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-std-focus-ring"
      >
        <span className="bg-std-cta-fill px-[calc(13*var(--std-u))] py-[calc(5*var(--std-u))] font-serif text-[calc(12*var(--std-u))] tracking-[0.04em] text-std-cta-ink underline underline-offset-2">
          {NOTE_CTA_LABEL}
        </span>
      </Link>
    </div>
  );
}
