import Image from "next/image";

import type { Ref } from "react";

import {
  ENVELOPE_BUTTON_LABEL,
  POSTMARK_CITY,
  POSTMARK_DATE,
} from "./invitation-content";
import type { InvitationPhase } from "./invitation-phase";

type EnvelopeProps = {
  phase: InvitationPhase;
  onOpen: () => void;
  /** The open control, so the stage can return focus to it when the envelope is resealed. */
  buttonRef?: Ref<HTMLButtonElement>;
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

/** While sealed, every layer floats together; they all mount at once, so they stay in step. */
const FLOAT = "[animation:var(--std-anim-float)]";

/** Pressed on the flap's point, which sits just below the envelope's middle. */
const SEAL_BOX = "absolute left-[39.5%] top-[39%] aspect-[777/800] w-[21%]";

/** Two jagged halves of the same seal, for the moment it cracks. */
const SEAL_HALVES = [
  "[clip-path:polygon(0_0,52%_0,46%_18%,55%_34%,45%_52%,54%_70%,47%_86%,51%_100%,0_100%)] [animation:var(--std-anim-seal-left)]",
  "[clip-path:polygon(52%_0,100%_0,100%_100%,51%_100%,47%_86%,54%_70%,45%_52%,55%_34%,46%_18%)] [animation:var(--std-anim-seal-right)]",
] as const;

const SPARKLE_BASE =
  "absolute left-1/2 top-1/2 opacity-0 [animation:var(--std-anim-sparkle)] " +
  "[clip-path:polygon(50%_0,62%_38%,100%_50%,62%_62%,50%_100%,38%_62%,0_50%,38%_38%)]";

/** One complete literal class string per sparkle — Tailwind cannot see a constructed one. */
const SPARKLES = [
  "h-[calc(9*var(--std-u))] w-[calc(9*var(--std-u))] bg-std-sparkle-pink [--std-sx:calc(0*var(--std-u))] [--std-sy:calc(-40*var(--std-u))]",
  "h-[calc(6*var(--std-u))] w-[calc(6*var(--std-u))] bg-std-sparkle-white [--std-sx:calc(28*var(--std-u))] [--std-sy:calc(-28*var(--std-u))]",
  "h-[calc(8*var(--std-u))] w-[calc(8*var(--std-u))] bg-std-sparkle-pink [--std-sx:calc(40*var(--std-u))] [--std-sy:calc(0*var(--std-u))]",
  "h-[calc(6*var(--std-u))] w-[calc(6*var(--std-u))] bg-std-sparkle-white [--std-sx:calc(28*var(--std-u))] [--std-sy:calc(28*var(--std-u))]",
  "h-[calc(9*var(--std-u))] w-[calc(9*var(--std-u))] bg-std-sparkle-pink [--std-sx:calc(0*var(--std-u))] [--std-sy:calc(40*var(--std-u))]",
  "h-[calc(6*var(--std-u))] w-[calc(6*var(--std-u))] bg-std-sparkle-white [--std-sx:calc(-28*var(--std-u))] [--std-sy:calc(28*var(--std-u))]",
  "h-[calc(8*var(--std-u))] w-[calc(8*var(--std-u))] bg-std-sparkle-pink [--std-sx:calc(-40*var(--std-u))] [--std-sy:calc(0*var(--std-u))]",
  "h-[calc(6*var(--std-u))] w-[calc(6*var(--std-u))] bg-std-sparkle-white [--std-sx:calc(-28*var(--std-u))] [--std-sy:calc(-28*var(--std-u))]",
] as const;

/**
 * The wax seal itself, softened to the palette. Its pressed laurel and interlocking rings
 * are the whole design; no lettering is printed over them.
 */
function SealFace() {
  return (
    <Image
        src="/images/wax-seal.png"
        alt=""
        fill
        loading="eager"
        sizes="(max-width: 560px) 22vw, 123px"
        className="object-contain [filter:var(--std-seal-filter)]"
      />
  );
}

/**
 * A pink postage stamp in the corner, and a round postmark carrying the city and the
 * date — so a guest learns where and when before the envelope is even opened.
 */
function Postmark({ fading }: { fading: boolean }) {
  return (
    <div
      aria-hidden
      className={
        fading
          ? "pointer-events-none absolute right-[-5%] top-[-26%] w-[40%] [animation:var(--std-anim-prompt-out)]"
          : "pointer-events-none absolute right-[-5%] top-[-26%] w-[40%]"
      }
    >
      <svg viewBox="0 0 168 84" className="block w-full overflow-visible">
        <g transform="translate(116 10) rotate(5 22 28)">
          <rect x="0" y="0" width="44" height="56" className="fill-std-stamp-fill" />
          <rect
            x="0"
            y="0"
            width="44"
            height="56"
            fill="none"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeDasharray="0 4.4"
            className="stroke-std-stamp-perforation"
          />
          <rect x="5" y="5" width="34" height="46" fill="none" strokeWidth="0.8" className="stroke-std-stamp-perforation" />
          <path d="M22 44 C22 38 21 34 22 30" fill="none" strokeWidth="1.2" className="stroke-std-sage-line" />
          <ellipse cx="17.5" cy="38" rx="4" ry="1.8" transform="rotate(-30 17.5 38)" className="fill-std-sage-line" />
          <g className="fill-std-sparkle-white">
            <circle cx="22" cy="18.5" r="4.2" />
            <circle cx="27.6" cy="22.6" r="4.2" />
            <circle cx="25.5" cy="29.2" r="4.2" />
            <circle cx="18.5" cy="29.2" r="4.2" />
            <circle cx="16.4" cy="22.6" r="4.2" />
          </g>
          <circle cx="22" cy="24" r="2.4" className="fill-std-postmark-ink" opacity="0.55" />
        </g>
        <g
          className="fill-none stroke-std-postmark-ink [animation:var(--std-anim-stamp)] [transform-box:fill-box] [transform-origin:center] [transform:rotate(-8deg)]"
          opacity="0.85"
        >
          <path d="M4 26 q 6.5 -4 13 0 t 13 0 t 13 0 t 13 0 t 13 0" strokeWidth="1.3" />
          <path d="M4 34 q 6.5 -4 13 0 t 13 0 t 13 0 t 13 0 t 13 0" strokeWidth="1.3" />
          <path d="M4 42 q 6.5 -4 13 0 t 13 0 t 13 0 t 13 0 t 13 0" strokeWidth="1.3" />
          <path d="M4 50 q 6.5 -4 13 0 t 13 0 t 13 0 t 13 0 t 13 0" strokeWidth="1.3" />
          <circle cx="108" cy="38" r="28" strokeWidth="1.6" className="fill-std-sparkle-white/40" />
          <circle cx="108" cy="38" r="25.4" strokeWidth="0.7" />
          <path id="std-postmark-arc" d="M88 38 A20 20 0 0 1 128 38" strokeWidth="0" />
          <text className="fill-std-postmark-ink stroke-none font-sans text-[6.6px] font-semibold tracking-[1.4px]">
            <textPath href="#std-postmark-arc" startOffset="50%" textAnchor="middle">
              {POSTMARK_CITY}
            </textPath>
          </text>
          <text
            x="108"
            y="47"
            textAnchor="middle"
            className="fill-std-postmark-ink stroke-none font-serif text-[11px] font-semibold tracking-[0.6px] lining-nums"
          >
            {POSTMARK_DATE}
          </text>
        </g>
      </svg>
    </div>
  );
}
export function Envelope({ phase, onOpen, buttonRef }: EnvelopeProps) {
  const closed = phase === "closed";
  const opening = phase === "opening";
  const open = phase === "open";
  const showSealLayer = closed || opening;
  const box = closed ? `${LAYER_BOX} ${FLOAT}` : LAYER_BOX;

  return (
    <>
      {/* Back of the envelope, with its patterned liner. */}
      <div aria-hidden className={`${box} z-[1]`}>
        <div className="absolute inset-0 rounded-[3px] [background:var(--std-env-back-fill)] [box-shadow:var(--std-env-back-shadow)]" />
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
              : `${box} pointer-events-none z-[6] [perspective-origin:50%_0] [perspective:760px]`
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
            <div className="absolute inset-0 [background:var(--std-env-flap-fill)] [mask:var(--std-flap-mask)]" />
          </div>

          {/* Flap back, revealed as the flap lies over. */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateX(180deg)]">
            <div className="absolute inset-0 [background:var(--std-env-flap-back-fill)] [mask:var(--std-flap-back-mask)]" />
            <div className="absolute inset-0 [background:var(--std-liner-pattern)] [clip-path:polygon(5%_97%,95%_97%,50%_44%)]" />
          </div>
        </div>
      </div>

      {/* Front pocket: three folded panels. */}
      <div
        aria-hidden
        className={`${box} pointer-events-none z-[5] group-has-[button:hover]:[filter:var(--std-env-lift-shadow)]`}
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
      </div>

      {/* Postmark, wax seal, and the single control that opens the envelope. */}
      {showSealLayer && (
        <div className={`${box} z-[8]`}>
          <Postmark fading={opening} />

          {opening ? (
            <div aria-hidden className={SEAL_BOX}>
              {SEAL_HALVES.map((half) => (
                <div key={half} className={`absolute inset-0 ${half}`}>
                  <SealFace />
                </div>
              ))}
              {SPARKLES.map((sparkle) => (
                <span key={sparkle} className={`${SPARKLE_BASE} ${sparkle}`} />
              ))}
            </div>
          ) : (
            <div
              className={`${SEAL_BOX} [transition:scale_140ms_ease] motion-reduce:[transition:none] group-has-[button:active]:[scale:0.94]`}
            >
              <SealFace />
            </div>
          )}

          {closed && (
            <button
              ref={buttonRef}
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
