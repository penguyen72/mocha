import { Reveal, TabSwitch } from "@mocha/ui";

import {
  DOWNTOWN_HOTELS,
  ESTATE_HOTELS,
  STAY_EYEBROW,
  STAY_HEADING,
  STAY_INTRO,
  type Hotel,
} from "./stay-content";

function HotelGrid({ hotels }: { hotels: Hotel[] }) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
      {hotels.map((hotel, index) => (
        <Reveal key={hotel.name} delay={(index % 4) * 0.085}>
          <div className="flex flex-col">
            {/* Placeholder pending real hotel photography. */}
            <div className="aspect-square rounded-lg bg-gradient-to-br from-bb-clay/40 to-bb-terracotta/40" />
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-bb-peach">{hotel.tag}</p>
            <h3 className="mt-1 font-serif text-xl">{hotel.name}</h3>
            <p className="mt-2 text-sm text-inverted-foreground/70">{hotel.description}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function Stay() {
  return (
    <section
      id="stay"
      className="bg-inverted-background px-6 py-24 text-inverted-foreground sm:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.28em] text-bb-peach">{STAY_EYEBROW}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{STAY_HEADING}</h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-4 max-w-2xl text-inverted-foreground/70">{STAY_INTRO}</p>
        </Reveal>

        <div className="mt-14 [--color-foreground:var(--site-inverted-foreground)]">
          <TabSwitch
            tabs={[
              {
                id: "estate",
                label: "On the Estate",
                panel: <HotelGrid hotels={ESTATE_HOTELS} />,
              },
              {
                id: "downtown",
                label: "Downtown Chattanooga",
                panel: <HotelGrid hotels={DOWNTOWN_HOTELS} />,
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
