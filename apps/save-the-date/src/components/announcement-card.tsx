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

const NAME = `font-script text-[calc(33*var(--std-u))] leading-[1.05] ${FOIL}`;

const AMPERSAND =
  "my-[calc(1*var(--std-u))] font-serif text-[calc(21*var(--std-u))] font-medium leading-none text-std-accent-ink";

const ANNOUNCEMENT =
  "font-sans text-[calc(8.5*var(--std-u))] font-medium uppercase leading-none tracking-[0.16em] text-std-accent-ink";

/**
 * Centred stationery: a small sprig, the couple's names in rose-pearl foil joined by a
 * serif ampersand, and the announcement in small spaced capitals that echo "October 2027"
 * on the date card. Everything sits in the
 * card's upper two-thirds, the part the Polaroid does not cover. While the card is being
 * delivered, each line writes itself on in turn; at rest the names keep a slow sheen.
 */
export function AnnouncementCard({ animated }: AnnouncementCardProps) {
  const sprig = animated ? `${SPRIG} ${SPRIG_IN}` : SPRIG;
  return (
    <div className={animated ? `${CARD} ${CARD_ANIMATION}` : CARD}>
      <div className="absolute inset-[calc(5*var(--std-u))] [background:var(--std-lace-pattern)]" />
      <div className="absolute inset-[calc(14*var(--std-u))] border border-std-lace-line bg-std-blush-card" />

      <div aria-hidden className="absolute inset-x-[calc(16*var(--std-u))] top-[8%] flex flex-col items-center">
        <svg viewBox="0 0 60 16" className="w-[calc(50*var(--std-u))] overflow-visible">
          <path d="M8 10 Q30 3 52 10" fill="none" strokeWidth="0.8" className="stroke-std-sage-line" />
          <g className="fill-std-sage-line">
            <ellipse cx="15" cy="6.6" rx="4" ry="1.6" transform="rotate(-28 15 6.6)" />
            <ellipse cx="21" cy="10.4" rx="3.6" ry="1.5" transform="rotate(22 21 10.4)" />
            <ellipse cx="45" cy="6.6" rx="4" ry="1.6" transform="rotate(28 45 6.6)" />
            <ellipse cx="39" cy="10.4" rx="3.6" ry="1.5" transform="rotate(-22 39 10.4)" />
          </g>
          <circle cx="30" cy="5.6" r="3.4" className="fill-std-sparkle-pink" />
          <circle cx="30" cy="5.6" r="1.2" className="fill-std-postmark-ink" opacity="0.5" />
        </svg>

        <span
          className={
            animated
              ? `mt-[calc(4*var(--std-u))] ${NAME} ${WRITE_ON} [animation:var(--std-anim-write-1),var(--std-anim-foil)]`
              : `mt-[calc(4*var(--std-u))] ${NAME} [animation:var(--std-anim-foil)]`
          }
        >
          {ANNOUNCEMENT_LINE_1}
        </span>
        <span
          className={
            animated
              ? `${AMPERSAND} ${WRITE_ON} [animation:var(--std-anim-write-2)]`
              : AMPERSAND
          }
        >
          {ANNOUNCEMENT_LINE_2}
        </span>
        <span
          className={
            animated
              ? `${NAME} ${WRITE_ON} [animation:var(--std-anim-write-3),var(--std-anim-foil)]`
              : `${NAME} [animation:var(--std-anim-foil)]`
          }
        >
          {ANNOUNCEMENT_LINE_3}
        </span>

        <span
          className={
            animated
              ? `mt-[calc(8*var(--std-u))] ${ANNOUNCEMENT} ${WRITE_ON} [animation:var(--std-anim-write-4)]`
              : `mt-[calc(8*var(--std-u))] ${ANNOUNCEMENT}`
          }
        >
          {ANNOUNCEMENT_LINE_4}
        </span>
      </div>

      <FloralSprig className={`${sprig} left-[-7%] top-[-5%] [transform:rotate(-12deg)]`} />
      <FloralSprig className={`${sprig} bottom-[-5%] right-[-6%] [transform:rotate(160deg)]`} />
    </div>
  );
}
