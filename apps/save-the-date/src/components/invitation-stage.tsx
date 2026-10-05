"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
} from "react";

import { AnnouncementCard } from "./announcement-card";
import { DateCard } from "./date-card";
import { Envelope } from "./envelope";
import { InvitationNote } from "./invitation-note";
import { MailHeader, OpenPrompt } from "./mail-header";
import { PetalScatter } from "./petal-scatter";
import { PhotoCard } from "./photo-card";

import { INVITATION_HEADING } from "./invitation-content";
import {
  CLOSING_DURATION_MS,
  OPENING_DURATION_MS,
  type InvitationPhase,
} from "./invitation-phase";

/** Addressable state for the opened invitation, so a reload or shared link stays open. */
const OPEN_HASH = "#open";

/**
 * The opened invitation's cards and note sit lower in the frame than the sealed envelope
 * does, so the whole stage sits 3.5% higher, sealed or open. Once open it rises a further
 * 2.5% so the cards, note and links sit centred in the floral frame; while opening, it
 * drifts up as the cards rise rather than jumping, and while closing it drifts back down
 * as the flap folds.
 */
const STAGE_FRAME =
  "group relative aspect-[455/779] w-[var(--std-stage-width)] flex-none " +
  "[animation:var(--std-anim-stage-in)] @container";

const STAGE_SEALED = "[translate:0_-3.5%]";
const STAGE_OPEN = "[translate:0_-6%]";
const STAGE_RISING = "[translate:0_-6%] [transition:var(--std-stage-rise-transition)]";
const STAGE_LOWERING = "[translate:0_-3.5%] [transition:var(--std-stage-lower-transition)]";

function subscribeToHash(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => {
    window.removeEventListener("hashchange", onStoreChange);
  };
}

function readHash() {
  return window.location.hash;
}

/** The server has no location, and the prerendered page is always the sealed envelope. */
function readServerHash() {
  return "";
}

/** Tells the hash store the hash changed; replaceState alone does not fire hashchange. */
function notifyHashChange() {
  window.dispatchEvent(new Event("hashchange"));
}

/** Feeds the cards' parallax: the pointer's position over the stage, from -1 to 1. */
function tiltTowards(event: PointerEvent<HTMLDivElement>) {
  if (prefersReducedMotion()) return;
  const frame = event.currentTarget;
  const bounds = frame.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
  frame.style.setProperty("--std-tilt-x", Math.max(-1, Math.min(1, x)).toFixed(3));
  frame.style.setProperty("--std-tilt-y", Math.max(-1, Math.min(1, y)).toFixed(3));
}

function settleTilt(event: PointerEvent<HTMLDivElement>) {
  event.currentTarget.style.setProperty("--std-tilt-x", "0");
  event.currentTarget.style.setProperty("--std-tilt-y", "0");
}

/** The vertical offset in a computed transform: matrix(...)'s f, or matrix3d(...)'s 14th value. */
function translateYOf(transform: string) {
  const values = /^matrix(3d)?\((.+)\)$/.exec(transform);
  if (values === null) return 0;
  const parts = values[2].split(",").map(Number);
  return (values[1] ? parts[13] : parts[5]) || 0;
}

function scaleOf(element: Element | null) {
  const scale = element === null ? "none" : getComputedStyle(element).scale;
  return scale === "none" || !scale ? 1 : Number.parseFloat(scale) || 1;
}

/**
 * The sealed envelope floats, and its seal swells under the pointer, but the opening
 * choreography starts from rest. Recording where both were at the click lets the opening
 * ease them back from there instead of snapping in a single frame.
 */
function holdRestingPose(frame: HTMLDivElement) {
  const layer = frame.querySelector("[data-envelope-float]");
  const floatY = layer === null ? 0 : translateYOf(getComputedStyle(layer).transform);
  const sealScale =
    scaleOf(frame.querySelector("[data-seal-rest]")) * scaleOf(frame.querySelector("[data-seal-swell]"));
  frame.style.setProperty("--std-float-from", `${Number(floatY.toFixed(2))}px`);
  frame.style.setProperty("--std-seal-from", sealScale.toFixed(3));
}

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function InvitationStage() {
  const [phase, setPhase] = useState<InvitationPhase>("closed");
  const entryHash = useSyncExternalStore(subscribeToHash, readHash, readServerHash);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousPhaseRef = useRef<InvitationPhase>("closed");
  const envelopeButtonRef = useRef<HTMLButtonElement>(null);
  const resealedRef = useRef(false);
  const [resealed, setResealed] = useState(false);

  // Arriving at /#open shows the opened invitation straight away. Deriving that from
  // useSyncExternalStore rather than an effect is what keeps the server render, the
  // hydration render and the client render consistent without a cascading setState:
  // the server and hydration both see the sealed envelope, then React re-renders with
  // the real hash.
  //
  // On a hard load of /#open the prerendered sealed envelope would paint first. An inline
  // script in the layout marks the page before that paint, and globals.css holds the stage
  // hidden while it is still sealed, then fades it in already open.
  const effectivePhase: InvitationPhase =
    phase === "closed" && entryHash === OPEN_HASH ? "open" : phase;

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  // Turning reduced motion on mid-choreography stops every animation in CSS, but the
  // cracked seal halves have keyframes and no resting state, so they would hang around
  // until the timer fired. Settle immediately instead, as the design prototype does.
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const settle = () => {
      if (!query.matches) return;
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setPhase((current) =>
        current === "opening" ? "open" : current === "closing" ? "closed" : current,
      );
    };

    query.addEventListener("change", settle);
    return () => {
      query.removeEventListener("change", settle);
    };
  }, []);

  // Announce the invitation once it has finished opening, and hand focus back to the
  // envelope once it has been resealed.
  useEffect(() => {
    if (previousPhaseRef.current === "opening" && effectivePhase === "open") {
      headingRef.current?.focus({ preventScroll: true });
    }
    if (effectivePhase === "closed" && resealedRef.current) {
      resealedRef.current = false;
      envelopeButtonRef.current?.focus({ preventScroll: true });
    }
    previousPhaseRef.current = effectivePhase;
  }, [effectivePhase]);

  const open = useCallback(() => {
    if (phase !== "closed") return;

    window.history.replaceState(null, "", OPEN_HASH);

    if (prefersReducedMotion()) {
      setPhase("open");
      return;
    }

    if (frameRef.current !== null) holdRestingPose(frameRef.current);
    setPhase("opening");
    timerRef.current = setTimeout(() => setPhase("open"), OPENING_DURATION_MS);
  }, [phase]);

  const replay = useCallback(() => {
    if (effectivePhase !== "open") return;

    resealedRef.current = true;
    setResealed(true);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    notifyHashChange();

    if (prefersReducedMotion()) {
      setPhase("closed");
      return;
    }

    setPhase("closing");
    timerRef.current = setTimeout(() => setPhase("closed"), CLOSING_DURATION_MS);
  }, [effectivePhase]);

  const opening = effectivePhase === "opening";
  const closing = effectivePhase === "closing";
  const revealed = effectivePhase !== "closed";

  return (
    <div
      ref={frameRef}
      // data-sealed lets globals.css keep the stage hidden on a hard load of /#open until
      // React swaps the prerendered sealed envelope for the opened invitation.
      data-stage
      data-sealed={effectivePhase === "closed" ? "" : undefined}
      className={`${STAGE_FRAME} ${opening ? STAGE_RISING : closing ? STAGE_LOWERING : revealed ? STAGE_OPEN : STAGE_SEALED}`}
      onPointerMove={tiltTowards} onPointerLeave={settleTilt}>
      {/* Candlelight: an ivory glow behind the names and envelope that pushes the floral
          watercolour back. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 [background:var(--std-candlelight)]" />
      {!revealed || opening ? (
        <>
          <MailHeader fading={opening} />
          <OpenPrompt fading={opening} />
        </>
      ) : null}
      <Envelope
        phase={effectivePhase}
        onOpen={open}
        buttonRef={envelopeButtonRef}
        resealed={resealed}
      />

      {revealed && (
        <>
          <h1 ref={headingRef} tabIndex={-1} className="sr-only">
            {INVITATION_HEADING}
          </h1>
          <PetalScatter leaving={closing} />
          <AnnouncementCard animated={opening} tucking={closing} />
          <DateCard animated={opening} tucking={closing} />
          <PhotoCard animated={opening} tucking={closing} />
          <InvitationNote animated={opening} leaving={closing} onReplay={replay} />
        </>
      )}
    </div>
  );
}
