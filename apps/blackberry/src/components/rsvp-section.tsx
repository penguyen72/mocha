import { Reveal } from "@mocha/ui";

import { RsvpForm } from "./rsvp-form";

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
          <p className="mt-6 text-sm text-white/80">
            Kindly respond by <strong className="font-medium">August 1, 2027</strong>. One form
            per household — add each guest below.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-12 max-w-2xl">
        <RsvpForm />
      </div>
    </section>
  );
}
