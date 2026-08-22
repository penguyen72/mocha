import { Reveal } from "@mocha/ui";

import {
  TRAVEL_ADDRESS_LINE_1,
  TRAVEL_ADDRESS_LINE_2,
  TRAVEL_EYEBROW,
  TRAVEL_HEADING,
  TRAVEL_ICON_ITEMS,
  TRAVEL_INTRO,
} from "./travel-content";

export function Travel() {
  return (
    <section id="travel" className="bg-background px-6 py-24 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.28em] text-bb-clay">{TRAVEL_EYEBROW}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mt-3 font-serif text-4xl text-foreground sm:text-5xl">
            {TRAVEL_HEADING}
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-4 max-w-2xl text-muted">{TRAVEL_INTRO}</p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-8">
            {TRAVEL_ICON_ITEMS.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.08}>
                <div className="flex gap-5">
                  <span
                    aria-hidden
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bb-peach text-lg text-foreground"
                  >
                    {item.icon}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted">{item.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            {/* Placeholder pending real venue photography. */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-bb-blush to-bb-peach">
              <div className="absolute bottom-6 left-6 rounded-md bg-inverted-foreground px-6 py-4 shadow-lg">
                <p className="font-serif text-lg text-foreground">{TRAVEL_ADDRESS_LINE_1}</p>
                <p className="text-sm text-muted">{TRAVEL_ADDRESS_LINE_2}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
