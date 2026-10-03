type PetalScatterProps = {
  /** True only while the opening choreography is running. */
  animated: boolean;
};

const PETAL_SHAPE =
  "rounded-[50%_50%_46%_54%/64%_60%_40%_36%] " +
  "[background:var(--std-petal-fill)] [box-shadow:var(--std-petal-shadow)]";

const PETAL_BASE = `absolute ${PETAL_SHAPE}`;

/**
 * One complete literal class string per petal — Tailwind cannot see a constructed one.
 * Each carries its offset back to the envelope's centre (--std-px/--std-py), where the
 * burst starts, and one of two gentle sways that keeps it moving once it has landed.
 */
const PETAL_PLACEMENTS = [
  "left-[6%] top-[27%] h-[calc(14*var(--std-u))] w-[calc(18*var(--std-u))] [transform:rotate(25deg)] [--std-px:calc(200*var(--std-u))] [--std-py:calc(218*var(--std-u))]",
  "left-[86%] top-[23%] h-[calc(12.6*var(--std-u))] w-[calc(16.2*var(--std-u))] [transform:rotate(-35deg)] [--std-px:calc(-164*var(--std-u))] [--std-py:calc(249*var(--std-u))]",
  "left-[90%] top-[62%] h-[calc(15.4*var(--std-u))] w-[calc(19.8*var(--std-u))] [transform:rotate(70deg)] [--std-px:calc(-182*var(--std-u))] [--std-py:calc(-55*var(--std-u))]",
  "left-[4%] top-[69%] h-[calc(13.3*var(--std-u))] w-[calc(17.1*var(--std-u))] [transform:rotate(-20deg)] [--std-px:calc(209*var(--std-u))] [--std-py:calc(-109*var(--std-u))]",
  "left-[63%] top-[71%] h-[calc(11.9*var(--std-u))] w-[calc(15.3*var(--std-u))] [transform:rotate(118deg)] [--std-px:calc(-59*var(--std-u))] [--std-py:calc(-125*var(--std-u))]",
  "left-[73%] top-[15%] h-[calc(14*var(--std-u))] w-[calc(18*var(--std-u))] [transform:rotate(40deg)] [--std-px:calc(-105*var(--std-u))] [--std-py:calc(312*var(--std-u))]",
  "left-[29%] top-[13%] h-[calc(12.6*var(--std-u))] w-[calc(16.2*var(--std-u))] [transform:rotate(-62deg)] [--std-px:calc(96*var(--std-u))] [--std-py:calc(327*var(--std-u))]",
] as const;

/** The resting sway, alternating between two rhythms so the petals never move in step. */
const PETAL_SWAYS = [
  "[animation:var(--std-anim-sway-a)]",
  "[animation:var(--std-anim-sway-b)]",
  "[animation:var(--std-anim-sway-a)]",
  "[animation:var(--std-anim-sway-b)]",
  "[animation:var(--std-anim-sway-a)]",
  "[animation:var(--std-anim-sway-b)]",
  "[animation:var(--std-anim-sway-a)]",
] as const;

const PETAL_ANIMATIONS = [
  "[animation:var(--std-anim-petal-0),var(--std-anim-sway-a)]",
  "[animation:var(--std-anim-petal-1),var(--std-anim-sway-b)]",
  "[animation:var(--std-anim-petal-2),var(--std-anim-sway-a)]",
  "[animation:var(--std-anim-petal-3),var(--std-anim-sway-b)]",
  "[animation:var(--std-anim-petal-4),var(--std-anim-sway-a)]",
  "[animation:var(--std-anim-petal-5),var(--std-anim-sway-b)]",
  "[animation:var(--std-anim-petal-6),var(--std-anim-sway-a)]",
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
              : `${PETAL_BASE} ${placement} ${PETAL_SWAYS[index]}`
          }
        />
      ))}
      <FallingPetals />
    </div>
  );
}

/**
 * A few petals that keep drifting down past the invitation. Each falls on its own slow
 * loop (outer element) while swaying side to side (inner element); under reduced motion
 * both animations are off and the petals stay invisible.
 */
const FALLING_PETALS = [
  { fall: "left-[14%] [animation:var(--std-anim-fall-0)]", size: "h-[calc(10*var(--std-u))] w-[calc(13*var(--std-u))]" },
  { fall: "left-[38%] [animation:var(--std-anim-fall-1)]", size: "h-[calc(8.5*var(--std-u))] w-[calc(11*var(--std-u))]" },
  { fall: "left-[61%] [animation:var(--std-anim-fall-2)]", size: "h-[calc(9.5*var(--std-u))] w-[calc(12.5*var(--std-u))]" },
  { fall: "left-[82%] [animation:var(--std-anim-fall-3)]", size: "h-[calc(8*var(--std-u))] w-[calc(10.5*var(--std-u))]" },
  { fall: "left-[25%] [animation:var(--std-anim-fall-4)]", size: "h-[calc(9*var(--std-u))] w-[calc(12*var(--std-u))]" },
  { fall: "left-[72%] [animation:var(--std-anim-fall-5)]", size: "h-[calc(10.5*var(--std-u))] w-[calc(13.5*var(--std-u))]" },
] as const;

function FallingPetals() {
  return (
    <>
      {FALLING_PETALS.map((petal) => (
        <div key={petal.fall} className={`absolute top-[-6%] opacity-0 ${petal.fall}`}>
          <div className={`${PETAL_SHAPE} ${petal.size} [animation:var(--std-anim-drift)]`} />
        </div>
      ))}
    </>
  );
}
