# Blackberry Wedding Travel & Stay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the Travel & Directions (`#travel`) and Accommodations/Stay (`#stay`) sections of the source design into `apps/blackberry`, composed into `page.tsx` right after `CountdownStrip`.

**Architecture:** Two Blackberry-local Server Components (`Travel`, `Stay`), each with a sibling `*-content.ts` file holding its copy as typed consts — no shared `content.ts`, no props from `page.tsx`. Travel is fully self-contained. Stay consumes a `TabSwitch` client primitive that Session 4 owns in `packages/ui` (not yet built at plan time) — `Stay` itself builds both hotel grids as server-rendered JSX and hands them to `TabSwitch` as `panel` props, so `Stay` never needs `"use client"`.

**Tech Stack:** Next.js 16 (App Router, Server Components by default), Tailwind v4 (`--bb-*` / `--site-*` → `--color-*` tokens already wired), `@mocha/ui`'s `Reveal` (Framer Motion scroll-reveal) and (once Session 4 lands it) `TabSwitch`.

## Global Constraints

- Server Components by default; this session adds **no** `"use client"` file of its own — the only client boundary is `TabSwitch`, owned by Session 4 in `packages/ui`.
- Content lives in a sibling `*-content.ts` file per section, both flat under `apps/blackberry/src/components/` (no subfolder) — the convention independently confirmed by Sessions 2, 4, and 5.
- This session adds **no** `packages/ui` components. `Stay` imports `TabSwitch` from `@mocha/ui` once Session 4 lands it (contract: `{ tabs: { id: string; label: string; panel: ReactNode }[]; defaultTabId?: string }`). Do not build a competing `Tabs`/`TabSwitch`.
- All 9 photo slots (1 venue + 8 hotel) are CSS gradient placeholder blocks using existing `bb-*` tokens — no `next/image`, no external requests, no new dependency.
- Copy is verbatim from `docs/superpowers/reference/blackberry-wedding-dc-source.md` §6–7.
- No new Vitest setup in `apps/blackberry` (none exists today; `page.tsx` has never had a test file) — matches the precedent independently confirmed by Sessions 1, 2, 4, and 5. Verification for this session's own files is `lint`/`typecheck`/`build` plus a manual dev-server check, not fabricated unit tests over static content composition.
- Imports in `page.tsx` use the `@/*` → `./src/*` alias already configured in `apps/blackberry/tsconfig.json`.
- Before editing `page.tsx` in any task, re-check its current contents first — other concurrent sessions (2, 4, 5) may have landed their own sections in the meantime.

---

## Travel track (unblocked — do this first)

### Task 1: Travel content data

**Files:**
- Create: `apps/blackberry/src/components/travel-content.ts`

**Interfaces:**
- Produces: `TravelIconItem` (type), `TRAVEL_EYEBROW: string`, `TRAVEL_HEADING: string`, `TRAVEL_INTRO: string`, `TRAVEL_ICON_ITEMS: TravelIconItem[]`, `TRAVEL_ADDRESS_LINE_1: string`, `TRAVEL_ADDRESS_LINE_2: string`.

- [ ] **Step 1: Write the content file**

```ts
// apps/blackberry/src/components/travel-content.ts
export type TravelIconItem = {
  icon: string;
  title: string;
  description: string;
};

export const TRAVEL_EYEBROW = "Getting Here";
export const TRAVEL_HEADING = "Travel & Directions";
export const TRAVEL_INTRO =
  "The Villa at Blackberry Ridge sits in the foothills of Trenton, Georgia — tucked between " +
  "Chattanooga and Atlanta. It's an easy drive from either, and the countryside on the way is " +
  "half the fun.";

export const TRAVEL_ICON_ITEMS: TravelIconItem[] = [
  {
    icon: "✈",
    title: "By air",
    description:
      "Chattanooga (CHA) is 45 min away; Atlanta (ATL) is ~2 hrs and has more direct flights. " +
      "Rental car recommended either way.",
  },
  {
    icon: "⌁",
    title: "By car",
    description:
      "Just off Hwy 301 in Trenton, GA. Free on-site parking — carpooling encouraged for the " +
      "welcome party.",
  },
  {
    icon: "✦",
    title: "Shuttle",
    description:
      "A shuttle will run between the downtown Chattanooga hotel block and the Villa on " +
      "Saturday. Details to come.",
  },
];

export const TRAVEL_ADDRESS_LINE_1 = "625 Hwy 301 S";
export const TRAVEL_ADDRESS_LINE_2 = "Trenton, GA 30752";
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @mocha/blackberry typecheck`
Expected: passes with no errors (this file has no consumers yet, so it only needs to be valid TypeScript on its own).

- [ ] **Step 3: Commit**

```bash
git add apps/blackberry/src/components/travel-content.ts
git commit -m "feat(blackberry): add Travel section content"
```

---

### Task 2: Travel section component

**Files:**
- Create: `apps/blackberry/src/components/travel.tsx`

**Interfaces:**
- Consumes: `Reveal` from `@mocha/ui` (props: `children`, `trigger?`, `distanceY?`, `duration?`, `delay?`, default `trigger="viewport"`); everything from Task 1's `travel-content.ts`.
- Produces: `Travel` (named export, no props) — a `<section id="travel">` Server Component.

- [ ] **Step 1: Write the component**

```tsx
// apps/blackberry/src/components/travel.tsx
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
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-bb-blush to-bb-peach">
              {/* Placeholder pending real venue photography. */}
              <div className="absolute bottom-6 left-6 rounded-md bg-white px-6 py-4 shadow-lg">
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
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm --filter @mocha/blackberry typecheck && pnpm --filter @mocha/blackberry lint`
Expected: both pass with no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/blackberry/src/components/travel.tsx
git commit -m "feat(blackberry): add Travel section component"
```

---

### Task 3: Compose Travel into page.tsx

**Files:**
- Modify: `apps/blackberry/src/app/page.tsx`

**Interfaces:**
- Consumes: `Travel` from `@/components/travel` (Task 2).

- [ ] **Step 1: Re-read the current page.tsx**

Run: `cat apps/blackberry/src/app/page.tsx`

Confirm the placeholder comment between `CountdownStrip` and `SiteFooter` is still there and no other session's section has landed in between. If Session 2's `Schedule`/`Party` (or any other session's section) has landed since this plan was written, insert `<Travel />` directly after that section instead of directly after `CountdownStrip` — Travel comes after Schedule/Party and before Stay/Explore/Details/FAQ/RSVP in the source's page order.

- [ ] **Step 2: Add the import and JSX element**

Add near the top with the other imports:

```tsx
import { Travel } from "@/components/travel";
```

Replace the placeholder comment block (or insert immediately after `CountdownStrip` / after Session 2's sections if landed) with:

```tsx
        {/* Session 2 inserts Schedule of Events and Wedding Party here. */}

        <Travel />

        {/* Session 3 inserts Accommodations (Stay) here once TabSwitch lands. */}
        {/* Sessions 4-5 insert Explore, Details, FAQ, and RSVP here. */}
```

- [ ] **Step 3: Verify the full pipeline**

Run from the repo root: `pnpm lint && pnpm typecheck && pnpm build`
Expected: all three pass.

- [ ] **Step 4: Manual visual check**

Run: `pnpm --filter @mocha/blackberry dev` (serves on port 3001), open `http://localhost:3001/#travel` in a browser. Confirm: eyebrow/heading/body render, the 3 icon rows show ✈/⌁/✦ with their titles and descriptions, the right column shows the gradient placeholder with the address card ("625 Hwy 301 S" / "Trenton, GA 30752") overlapping its bottom edge, and scrolling into the section triggers the reveal animation. Stop the dev server afterward.

- [ ] **Step 5: Commit**

```bash
git add apps/blackberry/src/app/page.tsx
git commit -m "feat(blackberry): compose Travel section into the page"
```

---

## Stay track

### Task 4: Stay content data (unblocked — do this now)

**Files:**
- Create: `apps/blackberry/src/components/stay-content.ts`

**Interfaces:**
- Produces: `Hotel` (type), `STAY_EYEBROW: string`, `STAY_HEADING: string`, `STAY_INTRO: string`, `ESTATE_HOTELS: Hotel[]`, `DOWNTOWN_HOTELS: Hotel[]`.

- [ ] **Step 1: Write the content file**

```ts
// apps/blackberry/src/components/stay-content.ts
export type Hotel = {
  tag: string;
  name: string;
  description: string;
};

export const STAY_EYEBROW = "Where to Stay";
export const STAY_HEADING = "Accommodations";
export const STAY_INTRO =
  "Make a weekend of it. Stay right on the estate, or settle into downtown Chattanooga " +
  "(about 30 minutes north). Mention the Liane & Peyton wedding block when you book.";

export const ESTATE_HOTELS: Hotel[] = [
  {
    tag: "On-site · Flagship",
    name: "Yorkshire Manor",
    description:
      "The grand manor on the estate — the heart of our room block. Sleeps a large group " +
      "with elegant shared spaces.",
  },
  {
    tag: "On-site",
    name: "Cotswold Manor",
    description:
      "A second European-style manor steps from the Villa. Warm, characterful rooms for " +
      "family and close friends.",
  },
  {
    tag: "On-site · Suite",
    name: "Blackberry Tower",
    description:
      "A private 3-bedroom tower tucked in the trees with a lakeside dock — sleeps up to 8.",
  },
  {
    tag: "On-site · Cozy",
    name: "The Cottage",
    description: "A charming garden cottage for a quiet, romantic stay right on the grounds.",
  },
];

export const DOWNTOWN_HOTELS: Hotel[] = [
  {
    tag: "~30 min · Historic",
    name: "The Read House",
    description:
      "A 1920s downtown landmark near the Tennessee Aquarium. Our recommended hotel block — " +
      "timeless and central.",
  },
  {
    tag: "~30 min · Modern",
    name: "The Westin Chattanooga",
    description:
      "Rooftop bar with Lookout Mountain views, heated pool, and boutique shopping in the " +
      "West Village.",
  },
  {
    tag: "~30 min · Boutique",
    name: "Hotel Indigo Downtown",
    description:
      "A stylish boutique stay in the heart of downtown, walkable to the riverfront and " +
      "restaurants.",
  },
  {
    tag: "~30 min · B&B",
    name: "Mayor's Mansion Inn",
    description:
      "An 1889 mansion turned intimate bed & breakfast in the Fort Wood historic district. " +
      "Romantic and quiet.",
  },
];
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @mocha/blackberry typecheck`
Expected: passes with no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/blackberry/src/components/stay-content.ts
git commit -m "feat(blackberry): add Stay section content"
```

---

### Task 5: Stay section component (blocked on Session 4's TabSwitch)

**Files:**
- Create: `apps/blackberry/src/components/stay.tsx`

**Interfaces:**
- Consumes: `Reveal`, `TabSwitch` from `@mocha/ui` (`TabSwitch` contract: `{ tabs: { id: string; label: string; panel: ReactNode }[]; defaultTabId?: string }`); everything from Task 4's `stay-content.ts`.
- Produces: `Stay` (named export, no props) — a `<section id="stay">` Server Component.

- [ ] **Step 1: Check whether TabSwitch is available yet**

Run: `grep -n "TabSwitch" packages/ui/src/index.ts`

- If **no match**: STOP. Do not implement a stand-in or a competing `Tabs` primitive — that risks a duplicate implementation Session 4's already building. Check `git log --oneline -10` for a new commit landing `TabSwitch`, or message the peer session (`mocha-5f` at plan-writing time — re-confirm via `ListAgents` since peer names can change across restarts) asking for a status update, then wait and retry this task once it lands.
- If **found**: read `packages/ui/src/components/tab-switch.tsx` and confirm the exported `TabSwitchProps` still matches the contract above. If it has changed, adapt Step 2 below to the real signature rather than the assumed one.

- [ ] **Step 2: Write the component**

```tsx
// apps/blackberry/src/components/stay.tsx
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
            <h3 className="mt-1 font-serif text-xl text-inverted-foreground">{hotel.name}</h3>
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

        <div className="mt-14">
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
```

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm --filter @mocha/blackberry typecheck && pnpm --filter @mocha/blackberry lint`
Expected: both pass with no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/blackberry/src/components/stay.tsx
git commit -m "feat(blackberry): add Stay section component"
```

---

### Task 6: Compose Stay into page.tsx

**Files:**
- Modify: `apps/blackberry/src/app/page.tsx`

**Interfaces:**
- Consumes: `Stay` from `@/components/stay` (Task 5).

- [ ] **Step 1: Re-read the current page.tsx**

Run: `cat apps/blackberry/src/app/page.tsx`

Confirm where `<Travel />` (Task 3) landed and whether Sessions 4/5's sections have landed since. `Stay` goes immediately after `<Travel />` and before Explore/Details/FAQ/RSVP.

- [ ] **Step 2: Add the import and JSX element**

Add near the other imports:

```tsx
import { Stay } from "@/components/stay";
```

Replace the `{/* Session 3 inserts Accommodations (Stay) here once TabSwitch lands. */}` comment with:

```tsx
        <Stay />
```

- [ ] **Step 3: Verify the full pipeline**

Run from the repo root: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
Expected: all four pass. (`pnpm test` exercises `packages/ui`, including Session 4's `TabSwitch` tests, which must also be green for this to succeed.)

- [ ] **Step 4: Manual visual check**

Run: `pnpm --filter @mocha/blackberry dev`, open `http://localhost:3001/#stay`. Confirm: dark section renders with the peach eyebrow, "On the Estate" is selected by default showing 4 hotel cards (Yorkshire Manor, Cotswold Manor, Blackberry Tower, The Cottage), clicking "Downtown Chattanooga" swaps to its 4 cards (The Read House, The Westin Chattanooga, Hotel Indigo Downtown, Mayor's Mansion Inn) and replays the reveal stagger, and the grid is 4 columns on desktop / 1 column on mobile (resize the window or use devtools device toolbar to confirm). Stop the dev server afterward.

- [ ] **Step 5: Commit**

```bash
git add apps/blackberry/src/app/page.tsx
git commit -m "feat(blackberry): compose Stay section into the page"
```
