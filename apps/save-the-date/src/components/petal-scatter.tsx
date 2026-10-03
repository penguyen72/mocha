const PETAL_SHAPE =
  "rounded-[50%_50%_46%_54%/64%_60%_40%_36%] " +
  "[background:var(--std-petal-fill)] [box-shadow:var(--std-petal-shadow)]";

/**
 * Petals drifting down past the invitation. Each falls on its own slow loop (outer
 * element) while swaying side to side (inner element). About half start with a negative
 * delay, so some are already mid-fall the moment the invitation opens. Under reduced
 * motion both animations are off and the petals stay invisible.
 *
 * One complete literal class string per petal — Tailwind cannot see a constructed one.
 */
const FALLING_PETALS = [
  { fall: "left-[8%] [animation:var(--std-anim-fall-0)]", size: "h-[calc(10*var(--std-u))] w-[calc(13*var(--std-u))] [animation:var(--std-anim-drift)]" },
  { fall: "left-[22%] [animation:var(--std-anim-fall-1)]", size: "h-[calc(8.5*var(--std-u))] w-[calc(11*var(--std-u))] [animation:var(--std-anim-drift-b)]" },
  { fall: "left-[35%] [animation:var(--std-anim-fall-2)]", size: "h-[calc(9.5*var(--std-u))] w-[calc(12.5*var(--std-u))] [animation:var(--std-anim-drift)]" },
  { fall: "left-[48%] [animation:var(--std-anim-fall-3)]", size: "h-[calc(8*var(--std-u))] w-[calc(10.5*var(--std-u))] [animation:var(--std-anim-drift-b)]" },
  { fall: "left-[61%] [animation:var(--std-anim-fall-4)]", size: "h-[calc(9*var(--std-u))] w-[calc(12*var(--std-u))] [animation:var(--std-anim-drift)]" },
  { fall: "left-[74%] [animation:var(--std-anim-fall-5)]", size: "h-[calc(10.5*var(--std-u))] w-[calc(13.5*var(--std-u))] [animation:var(--std-anim-drift-b)]" },
  { fall: "left-[87%] [animation:var(--std-anim-fall-6)]", size: "h-[calc(9*var(--std-u))] w-[calc(11.5*var(--std-u))] [animation:var(--std-anim-drift)]" },
  { fall: "left-[15%] [animation:var(--std-anim-fall-7)]", size: "h-[calc(8*var(--std-u))] w-[calc(10.5*var(--std-u))] [animation:var(--std-anim-drift-b)]" },
  { fall: "left-[42%] [animation:var(--std-anim-fall-8)]", size: "h-[calc(10*var(--std-u))] w-[calc(13*var(--std-u))] [animation:var(--std-anim-drift)]" },
  { fall: "left-[67%] [animation:var(--std-anim-fall-9)]", size: "h-[calc(8.5*var(--std-u))] w-[calc(11*var(--std-u))] [animation:var(--std-anim-drift-b)]" },
  { fall: "left-[92%] [animation:var(--std-anim-fall-10)]", size: "h-[calc(9.5*var(--std-u))] w-[calc(12.5*var(--std-u))] [animation:var(--std-anim-drift)]" },
  { fall: "left-[29%] [animation:var(--std-anim-fall-11)]", size: "h-[calc(9*var(--std-u))] w-[calc(12*var(--std-u))] [animation:var(--std-anim-drift-b)]" },
] as const;

export function PetalScatter() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[6]">
      {FALLING_PETALS.map((petal) => (
        <div key={petal.fall} data-petal className={`absolute top-[-6%] opacity-0 ${petal.fall}`}>
          <div className={`${PETAL_SHAPE} ${petal.size}`} />
        </div>
      ))}
    </div>
  );
}
