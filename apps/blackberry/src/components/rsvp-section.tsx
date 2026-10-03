import { Button, Reveal } from "@mocha/ui";

import { RSVP_URL } from "./rsvp-content";

export function RsvpSection() {
  return (
    <section id="rsvp" className="bg-bb-clay px-6 py-24 sm:px-12">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="font-script text-3xl text-white">will you join us?</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-2 font-serif text-5xl text-white sm:text-6xl">RSVP</h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 text-sm leading-relaxed text-bb-ink-black">
            Kindly respond by <strong className="font-medium">August 1, 2027</strong>.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <Button
            asChild
            size="lg"
            className="mt-10 bg-white text-foreground hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <a href={RSVP_URL} aria-describedby="rsvp-destination">
              RSVP Now
            </a>
          </Button>
          <p id="rsvp-destination" className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-bb-ink-black">
            You&apos;ll continue to Aisle Planner to complete your response.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
