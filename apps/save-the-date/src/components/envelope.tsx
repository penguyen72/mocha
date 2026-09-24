import Image from "next/image";

import {
  ENVELOPE_BUTTON_LABEL,
  ENVELOPE_LETTERING,
  ENVELOPE_PROMPT,
  SEAL_MONOGRAM,
} from "./invitation-content";
import type { InvitationPhase } from "./invitation-phase";

type EnvelopeProps = {
  phase: InvitationPhase;
  onOpen: () => void;
};

/**
 * Every envelope layer occupies this same box inside the stage frame, and every layer
 * lifts together when the envelope is hovered or pressed. The stage frame carries
 * `group`, and the envelope button is the only <button> inside it, so `group-has-` scopes
 * the lift precisely — and that button only exists while the envelope is closed, which is
 * exactly when the design lifts. Under reduced motion the affordance stays but the
 * transition does not.
 */
const LAYER_BOX =
  "absolute left-[13%] top-[42%] aspect-[8/5] w-[74%] " +
  "[transition:var(--std-env-lift-transition)] motion-reduce:[transition:none] " +
  "group-has-[button:hover]:[translate:0_-3px] group-has-[button:active]:[scale:0.99]";

export function Envelope({ phase, onOpen }: EnvelopeProps) {
  const opening = phase === "opening";
  const open = phase === "open";
  const showSealLayer = phase === "closed" || opening;

  return (
    <>
      {/* Back of the envelope, with its patterned liner. */}
      <div aria-hidden className={`${LAYER_BOX} z-[1]`}>
        <div className="absolute inset-0 rounded-[2px] [background:var(--std-env-back-fill)] [box-shadow:var(--std-env-back-shadow)]" />
        <div className="absolute left-[3.5%] right-[3.5%] top-[4%] h-[66%] [background:var(--std-liner-pattern)] [box-shadow:inset_0_0_0_calc(1*var(--std-u))_var(--std-liner-rule)]" />
      </div>

      {/* The flap. Rotates back through 178deg as the envelope opens, and drops
          behind the cards at the halfway point. */}
      <div
        aria-hidden
        className={
          open
            ? `${LAYER_BOX} pointer-events-none z-[2] [perspective-origin:50%_0] [perspective:760px]`
            : opening
              ? `${LAYER_BOX} pointer-events-none z-[6] [animation:var(--std-anim-flap-z)] [perspective-origin:50%_0] [perspective:760px]`
              : `${LAYER_BOX} pointer-events-none z-[6] [perspective-origin:50%_0] [perspective:760px]`
        }
      >
        <div
          className={
            opening
              ? "absolute inset-0 origin-top [animation:var(--std-anim-flap)] [transform-style:preserve-3d] [transform:rotateX(0deg)]"
              : open
                ? "absolute inset-0 origin-top [transform-style:preserve-3d] [transform:rotateX(178deg)]"
                : "absolute inset-0 origin-top [transform-style:preserve-3d] [transform:rotateX(0deg)]"
          }
        >
          {/* Flap front. */}
          <div className="absolute inset-0 [backface-visibility:hidden] [filter:var(--std-env-flap-shadow)]">
            <div className="absolute inset-0 [background:var(--std-gold-edge)] [clip-path:polygon(0_0,100%_0,50%_80%)]" />
            <div className="absolute inset-0 [background:var(--std-env-flap-fill)] [clip-path:polygon(1.4%_0,98.6%_0,50%_77.6%)]" />
            <div className="absolute left-0 right-0 top-[10%] whitespace-nowrap text-center font-std-envelope text-[calc(36*var(--std-u))] leading-none text-std-env-ink">
              {ENVELOPE_LETTERING}
            </div>
          </div>

          {/* Flap back, revealed as the flap lies over. */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateX(180deg)]">
            <div className="absolute inset-0 [background:var(--std-gold-edge)] [clip-path:polygon(0_100%,100%_100%,50%_20%)]" />
            <div className="absolute inset-0 [background:var(--std-env-flap-back-fill)] [clip-path:polygon(1.4%_100%,98.6%_100%,50%_22.4%)]" />
            <div className="absolute inset-0 [background:var(--std-liner-pattern)] [clip-path:polygon(5%_97%,95%_97%,50%_28%)]" />
          </div>
        </div>
      </div>

      {/* Front pocket: three panels and the gold rim. */}
      <div
        aria-hidden
        className={`${LAYER_BOX} pointer-events-none z-[5] group-has-[button:hover]:[filter:var(--std-env-lift-shadow)]`}
      >
        <div className="absolute inset-0 [filter:var(--std-env-left-shadow)]">
          <div className="absolute inset-0 [background:var(--std-env-left-fill)] [clip-path:polygon(0_0,50%_56%,0_100%)]" />
        </div>
        <div className="absolute inset-0 [filter:var(--std-env-right-shadow)]">
          <div className="absolute inset-0 [background:var(--std-env-right-fill)] [clip-path:polygon(100%_0,50%_56%,100%_100%)]" />
        </div>
        <div className="absolute inset-0 [filter:var(--std-env-bottom-shadow)]">
          <div className="absolute inset-0 [background:var(--std-env-bottom-fill)] [clip-path:polygon(0_100%,50%_36%,100%_100%)]" />
        </div>
        <div className="absolute inset-0 border-[calc(1.6*var(--std-u))] border-transparent [border-image:var(--std-gold-edge)_1]" />
      </div>

      {/* Prompt arc, wax seal, and the single control that opens the envelope. */}
      {showSealLayer && (
        <div className={`${LAYER_BOX} z-[8]`}>
          <svg
            aria-hidden
            viewBox="0 0 200 60"
            className={
              opening
                ? "absolute left-[33%] top-[41%] w-[34%] overflow-visible [animation:var(--std-anim-prompt-out)]"
                : "absolute left-[33%] top-[41%] w-[34%] overflow-visible"
            }
          >
            <path id="std-prompt-arc" d="M20 48 A130 130 0 0 1 180 48" fill="none" />
            <text className="fill-std-prompt-ink font-serif text-[17px] tracking-[1.5px]">
              <textPath href="#std-prompt-arc" startOffset="50%" textAnchor="middle">
                {ENVELOPE_PROMPT}
              </textPath>
            </text>
          </svg>

          <div
            className={
              opening
                ? "absolute left-[39.1%] top-[58%] aspect-[777/800] w-[21.8%] [animation:var(--std-anim-seal-out)]"
                : "absolute left-[39.1%] top-[58%] aspect-[777/800] w-[21.8%]"
            }
          >
            <Image
              src="/images/wax-seal.png"
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 560px) 22vw, 123px"
              className="object-contain"
            />
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center font-std-flourish text-[calc(19*var(--std-u))] leading-none text-std-seal-ink opacity-[0.82] [text-shadow:var(--std-seal-monogram-shadow)]"
            >
              {SEAL_MONOGRAM}
            </span>
          </div>

          {phase === "closed" && (
            <button
              type="button"
              aria-label={ENVELOPE_BUTTON_LABEL}
              onClick={onOpen}
              className="absolute inset-[-2%] cursor-pointer rounded-[6px] border-none bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-std-focus-ring"
            />
          )}
        </div>
      )}
    </>
  );
}
