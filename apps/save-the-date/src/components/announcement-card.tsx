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
  "[box-shadow:var(--std-announce-shadow)] [transform:rotate(-9deg)]";

const CARD_ANIMATION = "[animation:var(--std-anim-card-a),var(--std-anim-card-a-z)]";

const SPRIG = "pointer-events-none absolute h-[calc(22*var(--std-u))] w-[calc(22*var(--std-u))]";

export function AnnouncementCard({ animated }: AnnouncementCardProps) {
  return (
    <div className={animated ? `${CARD} ${CARD_ANIMATION}` : CARD}>
      <div className="absolute inset-[calc(5*var(--std-u))] [background:var(--std-lace-pattern)]" />
      <div className="absolute inset-[calc(14*var(--std-u))] border border-std-lace-line bg-std-blush-card" />

      <div
        aria-hidden
        className="absolute inset-0 flex flex-col pt-[21%] font-script text-[calc(27*var(--std-u))] leading-[1.02] text-std-announce-ink"
      >
        <span className="ml-[21%]">{ANNOUNCEMENT_LINE_1}</span>
        <span className="ml-[40%]">{ANNOUNCEMENT_LINE_2}</span>
        <span className="ml-[27%] mt-[14%]">{ANNOUNCEMENT_LINE_3}</span>
        <span className="ml-[42%]">{ANNOUNCEMENT_LINE_4}</span>
      </div>

      <FloralSprig className={`${SPRIG} left-[-7%] top-[-5%] [transform:rotate(-12deg)]`} />
      <FloralSprig className={`${SPRIG} bottom-[-5%] right-[-6%] [transform:rotate(160deg)]`} />
    </div>
  );
}
