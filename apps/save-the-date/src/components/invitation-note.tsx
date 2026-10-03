import { NOTE_TEXT } from "./invitation-content";

type InvitationNoteProps = {
  animated: boolean;
};

const NOTE =
  "absolute left-0 right-0 top-[78%] z-[6] flex items-center justify-center " +
  "gap-[calc(12*var(--std-u))]";

const NOTE_ANIMATION = "[animation:var(--std-anim-note-in)]";

const RULE = "h-px w-[calc(28*var(--std-u))] bg-std-liner-rule";

export function InvitationNote({ animated }: InvitationNoteProps) {
  return (
    <div className={animated ? `${NOTE} ${NOTE_ANIMATION}` : NOTE}>
      <span aria-hidden className={RULE} />
      <p className="m-0 text-center font-serif text-[calc(17*var(--std-u))] font-medium tracking-[0.06em] text-std-note-ink">
        {NOTE_TEXT}
      </p>
      <span aria-hidden className={RULE} />
    </div>
  );
}
