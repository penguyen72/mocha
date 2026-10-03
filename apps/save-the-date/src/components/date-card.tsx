import { PARALLAX_NEAR, SPRIG_IN, SPRIG_OUT } from "./card-motion";
import { FloralSprig } from "./floral-sprig";
import { RecordPlayer } from "./record-player";
import {
  DATE_CARD_DATE,
  DATE_CARD_DAY,
  DATE_CARD_LOCATION,
  DATE_CARD_MONTH,
  DATE_CARD_SAVE,
  DATE_CARD_THE,
  DATE_CARD_WEEK,
} from "./invitation-content";

type DateCardProps = {
  animated: boolean;
  /** True while the card goes back into the envelope as it reseals. */
  tucking?: boolean;
};

const CARD =
  "absolute left-[51.21%] top-[35.82%] z-[7] h-[24.65%] w-[35.16%] " +
  `[filter:var(--std-date-shadow)] [transform:rotate(9.5deg)] ${PARALLAX_NEAR}`;

const CARD_ANIMATION = "[animation:var(--std-anim-card-d),var(--std-anim-card-d-z)]";

const CARD_TUCK = "[animation:var(--std-anim-tuck-d),var(--std-anim-tuck-d-z)]";

const RULE = "absolute left-[3%] right-[3%] border-t-[1.5px] border-dotted border-std-lace-line";

const SPRIG =
  "pointer-events-none absolute bottom-[-6%] right-[-7%] h-[calc(22*var(--std-u))] " +
  "w-[calc(22*var(--std-u))] [transform:rotate(35deg)]";

/**
 * The song's record, in the open corner beside "Save". It keeps its own compositing layer at
 * rest, as it has during its intro, so the play icon does not snap to new pixels on the tilted
 * card when the intro ends.
 */
const RECORD = "absolute right-[11%] top-[6%] w-[calc(38*var(--std-u))] [will-change:scale]";

/** Once the card has landed, the record sets down with a soft settle (its vinyl turns to rest). */
const RECORD_IN = "[animation:var(--std-anim-record-in)]";

/** Hand-drawn strokes: pathLength 1 lets one dash animation draw any path. */
const STROKE = "[stroke-dasharray:1] [stroke-dashoffset:0]";

export function DateCard({ animated, tucking = false }: DateCardProps) {
  return (
    <div className={animated ? `${CARD} ${CARD_ANIMATION}` : tucking ? `${CARD} ${CARD_TUCK}` : CARD}>
      <div className="absolute inset-0 bg-std-date-card [-webkit-mask:var(--std-date-scallop)] [mask:var(--std-date-scallop)]" />

      <div className={`${RULE} top-[calc(5*var(--std-u))]`} />
      <div className={`${RULE} bottom-[calc(5*var(--std-u))]`} />

      <div aria-hidden className="absolute inset-0 flex flex-col px-[9%] pt-[10%] text-std-date-ink">
        {/* Inset so the lockup's left edge lines up with the first date of the week below. */}
        <span className="ml-[calc(1.6*var(--std-u))] flex flex-col">
          <span className="font-serif text-[calc(36*var(--std-u))] font-medium leading-none">
            {DATE_CARD_SAVE}
          </span>
          <span className="ml-[calc(3*var(--std-u))] flex items-baseline gap-[calc(4*var(--std-u))]">
            <span className="font-script text-[calc(22*var(--std-u))] leading-none">
              {DATE_CARD_THE}
            </span>
            <span className="font-serif text-[calc(36*var(--std-u))] font-medium leading-[1.05]">
              {DATE_CARD_DATE}
            </span>
          </span>
        </span>

        <span className="mt-[6%] text-center font-sans text-[calc(9.5*var(--std-u))] font-medium uppercase leading-none tracking-[0.22em]">
          {DATE_CARD_MONTH}
        </span>
        <span className="mt-[12%] grid grid-cols-7 text-center font-sans text-[calc(10.5*var(--std-u))] font-light leading-none">
          {DATE_CARD_WEEK.map((day) =>
            day === DATE_CARD_DAY ? (
              <span key={day} className="relative font-semibold text-std-accent-ink">
                {day}
                <svg
                  viewBox="0 0 40 36"
                  className="absolute left-1/2 top-1/2 h-[250%] w-[220%] -translate-x-1/2 -translate-y-1/2 overflow-visible"
                >
                  <path
                    d="M20 33 C 7 24, 1 16, 3 9.5 C 5 3, 14 1.5, 20 9 C 26 1.5, 35 3, 37 9.5 C 39 16, 33 24, 19 34.5"
                    pathLength={1}
                    fill="none"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    className={
                      animated
                        ? `stroke-std-accent-ink ${STROKE} [animation:var(--std-anim-heart)]`
                        : `stroke-std-accent-ink ${STROKE}`
                    }
                  />
                </svg>
              </span>
            ) : (
              <span key={day}>{day}</span>
            ),
          )}
        </span>

        <span
          className={
            animated
              ? "relative mt-[8.5%] text-center font-serif text-[calc(15*var(--std-u))] font-semibold tracking-[0.02em] [animation:var(--std-anim-city)]"
              : "relative mt-[8.5%] text-center font-serif text-[calc(15*var(--std-u))] font-semibold tracking-[0.02em]"
          }
        >
          {/* A faint sketch of the ridges around Trenton, drawn beneath the city. It is
              nudged down 4 units (2.5% of the card's width) to stay where it was when the
              city line moved up by that much. */}
          <svg
            viewBox="0 0 120 20"
            preserveAspectRatio="none"
            className="pointer-events-none absolute bottom-[-66%] left-1/2 h-[75%] w-[96%] -translate-x-1/2 translate-y-[calc(4*var(--std-u))] overflow-visible"
          >
            <path
              d="M6 19 C 18 15, 28 13, 40 14 S 60 9, 72 10 S 94 15, 114 18"
              pathLength={1}
              fill="none"
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0.55"
              className={
                animated
                  ? `stroke-std-sage-line ${STROKE} [animation:var(--std-anim-ridge)]`
                  : `stroke-std-sage-line ${STROKE}`
              }
            />
            <path
              d="M0 19 C 10 17, 18 9, 28 10 S 44 15, 52 12 S 66 2, 78 4.5 S 96 14, 106 12 S 116 15, 120 17"
              pathLength={1}
              fill="none"
              strokeWidth="1"
              strokeLinecap="round"
              className={
                animated
                  ? `stroke-std-sage-line ${STROKE} [animation:var(--std-anim-ridge)]`
                  : `stroke-std-sage-line ${STROKE}`
              }
            />
          </svg>
          <span className="relative">{DATE_CARD_LOCATION}</span>
        </span>
      </div>

      <RecordPlayer animated={animated} className={animated ? `${RECORD} ${RECORD_IN}` : RECORD} />
      <FloralSprig className={animated ? `${SPRIG} ${SPRIG_IN}` : tucking ? `${SPRIG} ${SPRIG_OUT}` : SPRIG} />
    </div>
  );
}
