import { Reveal } from "@mocha/ui";

import {
  SCHEDULE_EVENTS,
  SCHEDULE_EYEBROW,
  SCHEDULE_HEADING,
  SCHEDULE_INTRO,
  type ScheduleEvent,
} from "./schedule-content";

const DAY_BADGE_BG: Record<ScheduleEvent["dayColor"], string> = {
  mauve: "bg-bb-mauve",
  terracotta: "bg-bb-terracotta",
};

export function Schedule() {
  return (
    <section id="schedule" className="px-6 py-24 sm:px-12">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.28em] text-bb-clay">{SCHEDULE_EYEBROW}</p>
        </Reveal>
        <Reveal>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{SCHEDULE_HEADING}</h2>
        </Reveal>
        <Reveal>
          <p className="mt-6 text-base text-muted">{SCHEDULE_INTRO}</p>
        </Reveal>
      </div>

      <div className="relative mx-auto mt-16 max-w-4xl">
        <div className="absolute inset-y-0 left-4 w-px -translate-x-1/2 bg-bb-line md:left-1/2" />

        <div className="flex flex-col gap-10">
          {SCHEDULE_EVENTS.map((event, index) => {
            const side = index % 2 === 0 ? "left" : "right";
            const showBadge = index === 0 || SCHEDULE_EVENTS[index - 1].day !== event.day;

            return (
              <div key={`${event.day}-${event.title}`}>
                {showBadge && (
                  <Reveal>
                    <div className="relative z-10 mb-10 flex justify-center">
                      <span
                        className={`rounded-full px-5 py-1.5 text-xs uppercase tracking-[0.2em] text-white ${DAY_BADGE_BG[event.dayColor]}`}
                      >
                        {event.day}
                      </span>
                    </div>
                  </Reveal>
                )}

                <Reveal>
                  <div className="relative md:grid md:grid-cols-2 md:gap-x-12">
                    <span className="absolute left-4 top-2 h-3 w-3 -translate-x-1/2 rounded-full bg-bb-terracotta md:left-1/2" />
                    <div className={`pl-10 md:pl-0 ${side === "right" ? "md:col-start-2" : ""}`}>
                      <div
                        className={`rounded-2xl bg-white p-6 shadow-sm ${side === "left" ? "md:text-right" : ""}`}
                      >
                        <p className="font-serif text-xl text-bb-terracotta">{event.time}</p>
                        <h3 className="mt-1 font-serif text-2xl">{event.title}</h3>
                        <p className="mt-2 text-sm text-muted">{event.description}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
