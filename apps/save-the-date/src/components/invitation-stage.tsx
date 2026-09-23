"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AnnouncementCard } from "./announcement-card";
import { DateCard } from "./date-card";
import { Envelope } from "./envelope";
import { InvitationNote } from "./invitation-note";
import { PetalScatter } from "./petal-scatter";
import { PhotoCard } from "./photo-card";
import { Ribbon } from "./ribbon";

import { INVITATION_HEADING } from "./invitation-content";
import { OPENING_DURATION_MS, type InvitationPhase } from "./invitation-phase";

/** Addressable state for the opened invitation, so "back to invitation" can return to it. */
const OPEN_HASH = "#open";

const STAGE_FRAME =
  "relative aspect-[455/779] w-[min(100vw,560px,max(58.4dvh,340px))] flex-none " +
  "[animation:var(--std-anim-stage-in)] @container";

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function InvitationStage() {
  const [phase, setPhase] = useState<InvitationPhase>("closed");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousPhaseRef = useRef<InvitationPhase>("closed");

  // The server prerenders the closed envelope, so the first client render must match it.
  // Arriving at /#open upgrades here; the stage's 300ms fade-in covers the swap.
  useEffect(() => {
    if (window.location.hash === OPEN_HASH) {
      setPhase("open");
    }
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  // Announce the invitation once it has finished opening.
  useEffect(() => {
    if (previousPhaseRef.current === "opening" && phase === "open") {
      headingRef.current?.focus({ preventScroll: true });
    }
    previousPhaseRef.current = phase;
  }, [phase]);

  const open = useCallback(() => {
    if (phase !== "closed") return;

    window.history.replaceState(null, "", OPEN_HASH);

    if (prefersReducedMotion()) {
      setPhase("open");
      return;
    }

    setPhase("opening");
    timerRef.current = setTimeout(() => setPhase("open"), OPENING_DURATION_MS);
  }, [phase]);

  const opening = phase === "opening";
  const revealed = phase !== "closed";

  return (
    <div className={STAGE_FRAME}>
      <Envelope phase={phase} onOpen={open} />

      {revealed && (
        <>
          <h1 ref={headingRef} tabIndex={-1} className="sr-only">
            {INVITATION_HEADING}
          </h1>
          <PetalScatter animated={opening} />
          {opening && <Ribbon />}
          <AnnouncementCard animated={opening} />
          <DateCard animated={opening} />
          <PhotoCard animated={opening} />
          <InvitationNote animated={opening} />
        </>
      )}
    </div>
  );
}
