import { Reveal, TabSwitch } from "@mocha/ui";

import {
  EXPLORE_EYEBROW,
  EXPLORE_HEADING,
  EXPLORE_INTRO,
  EXPLORE_TABS,
  type ExploreActivity,
} from "./explore-content";

function ExploreGrid({ activities }: { activities: ExploreActivity[] }) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {activities.map((activity, index) => (
        <Reveal key={activity.name} delay={(index % 3) * 0.085}>
          <div>
            <div
              aria-hidden="true"
              className="aspect-[16/10] rounded-lg bg-gradient-to-br from-bb-peach to-bb-blush"
            />
            <h3 className="mt-4 font-serif text-xl text-foreground">{activity.name}</h3>
            <p className="mt-2 text-sm text-muted">{activity.description}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function Explore() {
  return (
    <section id="explore" className="bg-background px-6 py-24 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-bb-clay">{EXPLORE_EYEBROW}</p>
            <h2 className="mt-3 font-serif text-4xl text-foreground sm:text-5xl">
              {EXPLORE_HEADING}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm text-muted sm:text-base">
              {EXPLORE_INTRO}
            </p>
          </div>
        </Reveal>

        <div className="mt-14">
          <TabSwitch
            defaultTabId="chattanooga"
            tabs={EXPLORE_TABS.map((tab) => ({
              id: tab.id,
              label: tab.label,
              panel: <ExploreGrid activities={tab.activities} />,
            }))}
          />
        </div>
      </div>
    </section>
  );
}
