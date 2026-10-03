import { FOIL, PARALLAX_FAR, SPRIG_IN, WRITE_ON } from "./card-motion";
import { FloralSprig } from "./floral-sprig";
import {
  ANNOUNCEMENT_LINE_1,
  ANNOUNCEMENT_LINE_2,
  ANNOUNCEMENT_LINE_3,
  ANNOUNCEMENT_LINE_4,
} from "./invitation-content";

type AnnouncementCardProps = {
  animated: boolean;
};

const CARD =
  "absolute left-[16.81%] top-[18.87%] z-[7] h-[29.53%] w-[40.22%] bg-std-blush-card " +
  `[box-shadow:var(--std-announce-shadow)] [transform:rotate(-9deg)] ${PARALLAX_FAR}`;

const CARD_ANIMATION = "[animation:var(--std-anim-card-a),var(--std-anim-card-a-z)]";

const SPRIG = "pointer-events-none absolute h-[calc(22*var(--std-u))] w-[calc(22*var(--std-u))]";

/**
 * The couple's names in rose-pearl foil, then the announcement in rose ink. While the
 * card is being delivered, each line writes itself on in turn; at rest the foil keeps a
 * slow sheen.
 */
const LINES = [
  {
    text: ANNOUNCEMENT_LINE_1,
    rest: `ml-[21%] ${FOIL} [animation:var(--std-anim-foil)]`,
    writing: `ml-[21%] ${FOIL} ${WRITE_ON} [animation:var(--std-anim-write-1),var(--std-anim-foil)]`,
  },
  {
    text: ANNOUNCEMENT_LINE_2,
    rest: `ml-[40%] ${FOIL} [animation:var(--std-anim-foil)]`,
    writing: `ml-[40%] ${FOIL} ${WRITE_ON} [animation:var(--std-anim-write-2),var(--std-anim-foil)]`,
  },
  {
    text: ANNOUNCEMENT_LINE_3,
    rest: "ml-[22%] mt-[7%] w-fit",
    writing: `ml-[22%] mt-[7%] w-fit ${WRITE_ON} [animation:var(--std-anim-write-3)]`,
  },
  {
    text: ANNOUNCEMENT_LINE_4,
    rest: "ml-[35%] w-fit",
    writing: `ml-[35%] w-fit ${WRITE_ON} [animation:var(--std-anim-write-4)]`,
  },
] as const;

export function AnnouncementCard({ animated }: AnnouncementCardProps) {
  const sprig = animated ? `${SPRIG} ${SPRIG_IN}` : SPRIG;
  return (
    <div className={animated ? `${CARD} ${CARD_ANIMATION}` : CARD}>
      <div className="absolute inset-[calc(5*var(--std-u))] [background:var(--std-lace-pattern)]" />
      <div className="absolute inset-[calc(14*var(--std-u))] border border-std-lace-line bg-std-blush-card" />

      <div
        aria-hidden
        className="absolute inset-0 flex flex-col pt-[25%] font-script text-[calc(27*var(--std-u))] leading-[1.02] text-std-announce-ink"
      >
        {LINES.map((line) => (
          <span key={line.text} className={animated ? line.writing : line.rest}>
            {line.text}
          </span>
        ))}
      </div>

      <FloralSprig
        className={`${sprig} left-[-7%] top-[-5%] [transform:rotate(-12deg)]`}
      />
      <FloralSprig
        className={`${sprig} bottom-[-5%] right-[-6%] [transform:rotate(160deg)]`}
      />
    </div>
  );
}
