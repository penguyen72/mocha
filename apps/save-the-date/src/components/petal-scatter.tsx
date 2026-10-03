const PETAL_SHAPE =
  "rounded-[50%_50%_46%_54%/64%_60%_40%_36%] " +
  "[background:var(--std-petal-fill)] [box-shadow:var(--std-petal-shadow)]";

/**
 * Petals drifting down past the invitation, a surprise saved for when the envelope opens.
 * Each falls on its own slow loop (outer element) while swaying side to side (inner
 * element). About half start with a negative delay, so some are already mid-fall the
 * moment the invitation opens. Under reduced motion both animations are off and the
 * petals stay invisible.
 *
 * They drift at three depths: small, soft petals behind the envelope and cards; crisp ones
 * level with them; and two large, blurred ones in front of everything, as if close to the
 * eye.
 *
 * One complete literal class string per petal — Tailwind cannot see a constructed one.
 */
const DEPTHS = [
  {
    depth: "far",
    layer: "z-[1] opacity-60 blur-[0.4px]",
    petals: [
      { fall: "left-[12%] [animation:var(--std-anim-fall-0)]", size: "h-[calc(6.5*var(--std-u))] w-[calc(8.5*var(--std-u))] [animation:var(--std-anim-drift)]" },
      { fall: "left-[55%] [animation:var(--std-anim-fall-3)]", size: "h-[calc(6*var(--std-u))] w-[calc(8*var(--std-u))] [animation:var(--std-anim-drift-b)]" },
      { fall: "left-[74%] [animation:var(--std-anim-fall-5)]", size: "h-[calc(7*var(--std-u))] w-[calc(9*var(--std-u))] [animation:var(--std-anim-drift)]" },
      { fall: "left-[92%] [animation:var(--std-anim-fall-10)]", size: "h-[calc(6*var(--std-u))] w-[calc(8*var(--std-u))] [animation:var(--std-anim-drift-b)]" },
    ],
  },
  {
    depth: "mid",
    layer: "z-[6]",
    petals: [
      { fall: "left-[22%] [animation:var(--std-anim-fall-1)]", size: "h-[calc(8.5*var(--std-u))] w-[calc(11*var(--std-u))] [animation:var(--std-anim-drift-b)]" },
      { fall: "left-[35%] [animation:var(--std-anim-fall-2)]", size: "h-[calc(9.5*var(--std-u))] w-[calc(12.5*var(--std-u))] [animation:var(--std-anim-drift)]" },
      { fall: "left-[61%] [animation:var(--std-anim-fall-4)]", size: "h-[calc(9*var(--std-u))] w-[calc(12*var(--std-u))] [animation:var(--std-anim-drift)]" },
      { fall: "left-[87%] [animation:var(--std-anim-fall-6)]", size: "h-[calc(9*var(--std-u))] w-[calc(11.5*var(--std-u))] [animation:var(--std-anim-drift)]" },
      { fall: "left-[47%] [animation:var(--std-anim-fall-8)]", size: "h-[calc(10*var(--std-u))] w-[calc(13*var(--std-u))] [animation:var(--std-anim-drift)]" },
      { fall: "left-[67%] [animation:var(--std-anim-fall-9)]", size: "h-[calc(8.5*var(--std-u))] w-[calc(11*var(--std-u))] [animation:var(--std-anim-drift-b)]" },
    ],
  },
  {
    depth: "near",
    layer: "z-[10] opacity-80 blur-[1.4px]",
    petals: [
      { fall: "left-[6%] [animation:var(--std-anim-fall-7)]", size: "h-[calc(15*var(--std-u))] w-[calc(19*var(--std-u))] [animation:var(--std-anim-drift-b)]" },
      { fall: "left-[40%] [animation:var(--std-anim-fall-11)]", size: "h-[calc(14*var(--std-u))] w-[calc(18*var(--std-u))] [animation:var(--std-anim-drift)]" },
    ],
  },
] as const;

type PetalScatterProps = {
  /** True while the envelope reseals: the petals clear away with the note. */
  leaving?: boolean;
};

export function PetalScatter({ leaving = false }: PetalScatterProps) {
  return (
    <div
      aria-hidden
      className={
        leaving
          ? "pointer-events-none absolute inset-0 [animation:var(--std-anim-petals-out)]"
          : "pointer-events-none absolute inset-0"
      }
    >
      {DEPTHS.map(({ depth, layer, petals }) => (
        <div key={depth} data-petal-depth={depth} className={`absolute inset-0 ${layer}`}>
          {petals.map((petal) => (
            <div key={petal.fall} data-petal className={`absolute top-[-6%] opacity-0 ${petal.fall}`}>
              <div className={`${PETAL_SHAPE} ${petal.size}`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
