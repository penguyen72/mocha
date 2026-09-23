import { FloralSprig } from "./floral-sprig";
import {
  DATE_CARD_DATE,
  DATE_CARD_LOCATION,
  DATE_CARD_NUMERALS,
  DATE_CARD_SAVE,
  DATE_CARD_THE,
} from "./invitation-content";

type DateCardProps = {
  animated: boolean;
};

const CARD =
  "absolute left-[51.21%] top-[35.82%] z-[7] h-[24.65%] w-[35.16%] " +
  "[filter:var(--std-date-shadow)] [transform:rotate(9.5deg)]";

const CARD_ANIMATION = "[animation:var(--std-anim-card-d),var(--std-anim-card-d-z)]";

const RULE = "absolute left-[3%] right-[3%] border-t-[1.5px] border-dotted border-std-lace-line";

export function DateCard({ animated }: DateCardProps) {
  return (
    <div className={animated ? `${CARD} ${CARD_ANIMATION}` : CARD}>
      <div className="absolute inset-0 bg-std-date-card [-webkit-mask:var(--std-date-scallop)] [mask:var(--std-date-scallop)]" />

      <div className={`${RULE} top-[calc(5*var(--std-u))]`} />
      <div className={`${RULE} bottom-[calc(5*var(--std-u))]`} />

      <div aria-hidden className="absolute inset-0 flex flex-col px-[9%] pt-[13%] text-std-date-ink">
        <span className="font-sans text-[calc(31*var(--std-u))] font-light leading-none">
          {DATE_CARD_SAVE}
        </span>
        <span className="ml-[2%] flex items-baseline gap-[calc(4*var(--std-u))]">
          <span className="font-std-flourish text-[calc(21*var(--std-u))] leading-none">
            {DATE_CARD_THE}
          </span>
          <span className="font-sans text-[calc(31*var(--std-u))] font-light leading-[1.05]">
            {DATE_CARD_DATE}
          </span>
        </span>
        <span className="mt-[11%] text-center font-serif text-[calc(12.5*var(--std-u))]">
          {DATE_CARD_LOCATION}
        </span>
        <span className="mt-[6%] text-center font-sans text-[calc(27*var(--std-u))] font-light tracking-[0.02em]">
          {DATE_CARD_NUMERALS}
        </span>
      </div>

      <FloralSprig
        className="pointer-events-none absolute bottom-[-6%] right-[-7%] h-[calc(22*var(--std-u))] w-[calc(22*var(--std-u))] [transform:rotate(35deg)]"
      />
    </div>
  );
}
