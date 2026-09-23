type PetalScatterProps = {
  /** True only while the opening choreography is running. */
  animated: boolean;
};

const PETAL_BASE =
  "absolute rounded-[50%_50%_46%_54%/64%_60%_40%_36%] " +
  "[background:var(--std-petal-fill)] [box-shadow:var(--std-petal-shadow)]";

/** One complete literal class string per petal — Tailwind cannot see a constructed one. */
const PETAL_PLACEMENTS = [
  "left-[6%] top-[27%] h-[calc(14*var(--std-u))] w-[calc(18*var(--std-u))] [transform:rotate(25deg)]",
  "left-[86%] top-[23%] h-[calc(12.6*var(--std-u))] w-[calc(16.2*var(--std-u))] [transform:rotate(-35deg)]",
  "left-[90%] top-[62%] h-[calc(15.4*var(--std-u))] w-[calc(19.8*var(--std-u))] [transform:rotate(70deg)]",
  "left-[4%] top-[69%] h-[calc(13.3*var(--std-u))] w-[calc(17.1*var(--std-u))] [transform:rotate(-20deg)]",
  "left-[63%] top-[71%] h-[calc(11.9*var(--std-u))] w-[calc(15.3*var(--std-u))] [transform:rotate(118deg)]",
  "left-[73%] top-[15%] h-[calc(14*var(--std-u))] w-[calc(18*var(--std-u))] [transform:rotate(40deg)]",
  "left-[29%] top-[13%] h-[calc(12.6*var(--std-u))] w-[calc(16.2*var(--std-u))] [transform:rotate(-62deg)]",
] as const;

const PETAL_ANIMATIONS = [
  "[animation:var(--std-anim-petal-0)]",
  "[animation:var(--std-anim-petal-1)]",
  "[animation:var(--std-anim-petal-2)]",
  "[animation:var(--std-anim-petal-3)]",
  "[animation:var(--std-anim-petal-4)]",
  "[animation:var(--std-anim-petal-5)]",
  "[animation:var(--std-anim-petal-6)]",
] as const;

export function PetalScatter({ animated }: PetalScatterProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[6]">
      {PETAL_PLACEMENTS.map((placement, index) => (
        <div
          key={placement}
          className={
            animated
              ? `${PETAL_BASE} ${placement} ${PETAL_ANIMATIONS[index]}`
              : `${PETAL_BASE} ${placement}`
          }
        />
      ))}
    </div>
  );
}
