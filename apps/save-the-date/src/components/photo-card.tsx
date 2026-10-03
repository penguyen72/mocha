import Image from "next/image";

import { PARALLAX_MID, SPRIG_IN } from "./card-motion";
import { FloralSprig } from "./floral-sprig";
import { PHOTO_ALT, PHOTO_CAPTION } from "./invitation-content";

type PhotoCardProps = {
  animated: boolean;
};

const CARD =
  "absolute left-[12.31%] top-[42.49%] z-[7] h-[29.78%] w-[41.32%] " +
  "[background:var(--std-photo-mat-fill)] [box-shadow:var(--std-photo-shadow)] " +
  `[transform:rotate(-7deg)] ${PARALLAX_MID}`;

const CARD_ANIMATION = "[animation:var(--std-anim-card-p),var(--std-anim-card-p-z)]";

const SPRIG = "pointer-events-none absolute h-[calc(22*var(--std-u))] w-[calc(22*var(--std-u))]";

/** The photograph and its caption are already there when the Polaroid comes out of the envelope. */
const CAPTION =
  "absolute inset-x-0 top-[79%] flex items-center justify-center " +
  "font-script text-[calc(20*var(--std-u))] leading-none text-std-announce-ink";

export function PhotoCard({ animated }: PhotoCardProps) {
  return (
    <div className={animated ? `${CARD} ${CARD_ANIMATION}` : CARD}>
      <div className="absolute left-[5.5%] top-[4.6%] h-[71%] w-[89%] overflow-hidden bg-std-photo-well">
        <Image
          src="/images/couple-photo.jpg"
          alt={PHOTO_ALT}
          fill
          sizes="(max-width: 560px) 37vw, 207px"
          className="object-cover"
        />
      </div>

      <div aria-hidden className={CAPTION}>
        {/* The heart hangs off the caption's right edge so the words alone sit on the centre line. */}
        <span className="relative">
          {PHOTO_CAPTION}
          <svg
            viewBox="0 0 20 18"
            className="absolute left-full top-1/2 ml-[calc(4*var(--std-u))] h-[0.5em] w-[0.55em] -translate-y-1/2 fill-std-postmark-ink"
          >
            <path d="M10 17 C 3 12, 0 8, 1 4.5 C 2 1.5, 6.5 0.5, 10 4.5 C 13.5 0.5, 18 1.5, 19 4.5 C 20 8, 17 12, 10 17 Z" />
          </svg>
        </span>
      </div>

      <FloralSprig
        className={
          animated
            ? `${SPRIG} ${SPRIG_IN} bottom-[-5%] left-[-7%] [transform:rotate(200deg)]`
            : `${SPRIG} bottom-[-5%] left-[-7%] [transform:rotate(200deg)]`
        }
      />
    </div>
  );
}
