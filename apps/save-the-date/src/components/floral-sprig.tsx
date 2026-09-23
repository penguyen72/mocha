type FloralSprigProps = {
  /**
   * Complete positioning, sizing and rotation for this instance, as a literal class
   * string. The sprig is purely decorative and has no layout of its own.
   */
  className: string;
};

/**
 * The one decorative sprig from the design, drawn at 22 x 22 design units and reused at
 * four rotations across the three cards.
 */
export function FloralSprig({ className }: FloralSprigProps) {
  return (
    <div aria-hidden className={className}>
      <div className="absolute left-[-34%] top-[44%] h-[28%] w-[62%] rounded-[0_100%_0_100%] [background:var(--std-leaf-a-fill)] [transform:rotate(-18deg)]" />
      <div className="absolute right-[-30%] top-[14%] h-[26%] w-[56%] rounded-[100%_0_100%_0] [background:var(--std-leaf-b-fill)] [transform:rotate(-38deg)]" />
      <div className="absolute left-[78%] top-[78%] h-[30%] w-[30%] rounded-full [background:var(--std-bud-fill)]" />
      <div className="absolute inset-0 [background:var(--std-bloom-fill)]" />
    </div>
  );
}
