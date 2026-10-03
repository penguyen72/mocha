import Image from "next/image";

/**
 * The artwork is taller and narrower than the page, so covering the page with it would
 * crop away the frame's corners and the roses beside them. Instead it is drawn at the
 * stage's width, twice: its top half pinned to the top of the page and its bottom half
 * to the bottom, fading into each other across the frame's plain middle. The roses scale
 * with the card and the whole frame is always visible.
 */
const HALF = "absolute inset-x-0 h-[56%] overflow-hidden";

const ART = "absolute left-1/2 aspect-[1107/2399] w-[var(--std-stage-width)] -translate-x-1/2";

const HALVES = [
  { half: "top", box: `${HALF} top-0 [mask-image:var(--std-floral-fade-top)]`, art: `${ART} top-0` },
  { half: "bottom", box: `${HALF} bottom-0 [mask-image:var(--std-floral-fade-bottom)]`, art: `${ART} bottom-0` },
] as const;

export function FloralBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 [animation:var(--std-anim-bloom)] [filter:var(--std-floral-filter)]"
    >
      {HALVES.map(({ half, box, art }) => (
        <div key={half} data-floral-half={half} className={box}>
          <div className={art}>
            <Image
              src="/images/floral-background.png"
              alt=""
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 560px) 100vw, 560px"
              className="object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
