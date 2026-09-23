/**
 * The ribbon and bow that ride out of the envelope ahead of the cards. Mounted only
 * during the opening choreography — it has faded out by the time it ends.
 */
export function Ribbon() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-[47.25%] top-[13.6%] z-[3] h-[28.5%] w-[5.5%] [animation:var(--std-anim-ribbon),var(--std-anim-ribbon-z)]"
    >
      <div className="absolute inset-0 [background:var(--std-ribbon-fill)] [box-shadow:var(--std-ribbon-shadow)]" />
      <div className="absolute left-1/2 top-[30%] h-[calc(24*var(--std-u))] w-[calc(64*var(--std-u))] [transform:translate(-50%,-50%)]">
        <div className="absolute left-0 top-[10%] h-[80%] w-[46%] rounded-[50%] border-[calc(4*var(--std-u))] border-std-ribbon-loop [transform:rotate(-16deg)]" />
        <div className="absolute right-0 top-[10%] h-[80%] w-[46%] rounded-[50%] border-[calc(4*var(--std-u))] border-std-ribbon-loop [transform:rotate(16deg)]" />
        <div className="absolute left-1/2 top-1/2 h-[calc(13*var(--std-u))] w-[calc(11*var(--std-u))] rounded-[calc(3*var(--std-u))] [background:var(--std-ribbon-knot-fill)] [transform:translate(-50%,-50%)]" />
      </div>
    </div>
  );
}
