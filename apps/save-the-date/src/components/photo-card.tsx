import Image from "next/image";

import { FloralSprig } from "./floral-sprig";
import { PHOTO_ALT } from "./invitation-content";

type PhotoCardProps = {
  animated: boolean;
};

const CARD =
  "absolute left-[12.31%] top-[42.49%] z-[7] h-[29.78%] w-[41.32%] " +
  "[background:var(--std-photo-mat-fill)] [box-shadow:var(--std-photo-shadow)] " +
  "[transform:rotate(-7deg)]";

const CARD_ANIMATION = "[animation:var(--std-anim-card-p),var(--std-anim-card-p-z)]";

const SPRIG = "pointer-events-none absolute h-[calc(22*var(--std-u))] w-[calc(22*var(--std-u))]";

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
      <FloralSprig className={`${SPRIG} bottom-[-5%] left-[-7%] [transform:rotate(200deg)]`} />
    </div>
  );
}
