"use client";

import { Button } from "@mocha/ui";
import { useEffect, useRef } from "react";

import { RSVP_URL } from "./rsvp-content";

export function RsvpSheet() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const sheet = dialogRef.current;
    if (!sheet) return;

    let returnFocus: HTMLElement | null = null;
    let previousOverflow = document.body.style.overflow;

    const restore = () => {
      document.body.style.overflow = previousOverflow;
      if (returnFocus?.isConnected) returnFocus.focus();
    };

    const openSheet = (event: MouseEvent) => {
      if (
        event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        !(event.target instanceof Element)
      ) return;

      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (
        !link || link.href !== RSVP_URL || sheet.contains(link) ||
        link.target === "_blank" || typeof sheet.showModal !== "function"
      ) return;

      event.preventDefault();
      if (sheet.open) return;
      // Capture Menu before its exiting panel removes the mobile RSVP link.
      returnFocus = link.closest("nav")?.querySelector<HTMLButtonElement>("button") ?? link;
      previousOverflow = document.body.style.overflow;
      sheet.showModal();
      document.body.style.overflow = "hidden";
      sheet.querySelector<HTMLAnchorElement>("a")?.focus();
    };

    // Keep existing shared navigation/hero links and their no-JavaScript fallback.
    document.addEventListener("click", openSheet);
    sheet.addEventListener("close", restore);
    return () => {
      document.removeEventListener("click", openSheet);
      sheet.removeEventListener("close", restore);
      if (sheet.open) {
        sheet.close();
        document.body.style.overflow = previousOverflow;
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="rsvp-sheet bg-surface text-foreground"
      aria-labelledby="rsvp-sheet-heading"
      aria-describedby="rsvp-sheet-description"
      onCancel={(event) => {
        event.preventDefault();
        dialogRef.current?.close();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom
        ) dialogRef.current?.close();
      }}
    >
      <button
        type="button"
        aria-label="Close RSVP"
        onClick={() => dialogRef.current?.close()}
        className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full text-2xl hover:bg-bb-blush focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        <span aria-hidden="true">×</span>
      </button>
      <p className="font-script text-3xl text-foreground">a little note before you reply</p>
      <h2 id="rsvp-sheet-heading" className="mt-3 font-serif text-4xl sm:text-5xl">
        Will you join us?
      </h2>
      <p id="rsvp-sheet-description" className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-muted">
        You&apos;ll continue to Aisle Planner to complete your response.
      </p>
      <p className="mt-4 text-sm text-muted">
        Kindly respond by <strong className="font-medium">August 1, 2027</strong>.
      </p>
      <Button
        asChild
        size="lg"
        className="mt-8 bg-foreground text-background hover:bg-foreground/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
      >
        <a href={RSVP_URL}>Continue to RSVP</a>
      </Button>
    </dialog>
  );
}
