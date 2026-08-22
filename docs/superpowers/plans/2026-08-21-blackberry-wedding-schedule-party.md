# Blackberry Wedding Schedule & Wedding Party Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Schedule of Events timeline (`#schedule`) and Wedding Party grid (`#party`)
sections to `apps/blackberry`, composed into `page.tsx` between `CountdownStrip` and the
remaining Session 3–5 composition point.

**Architecture:** Two Blackberry-local, Server Component sections
(`apps/blackberry/src/components/schedule.tsx`, `.../party.tsx`), each with a colocated
`*-content.ts` data file, each using the shared `Reveal` primitive from `@mocha/ui` for
scroll-reveal/stagger. `apps/blackberry` has no Vitest setup yet (Session 1's tests all live in
`packages/ui`), so Task 1 also bootstraps Vitest + Testing Library for this app, mirroring
`packages/ui`'s existing config exactly.

**Tech Stack:** Next.js 16 (App Router, Server Components), React 19, Tailwind CSS v4 (via
`--bb-*`/`--site-*` CSS custom properties already wired in `apps/blackberry/src/app/globals.css`),
Framer Motion (via `@mocha/ui`'s `Reveal`), Vitest + React Testing Library.

## Global Constraints

- No Zod, no new shared `packages/ui` components — `Schedule`/`Party` are Blackberry-local per
  the design doc's Architecture principle.
- Both sections are Server Components; no `"use client"` directive in either file.
- Content data is colocated per-section (`schedule-content.ts`, `party-content.ts`), not a
  shared `content.ts`.
- Copy and data values must match the reference doc / design doc verbatim — no paraphrasing.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` must all pass from the repository
  root before this work is considered complete (per `AGENTS.md`).

---

### Task 1: Vitest infrastructure for `apps/blackberry` + Schedule of Events section

**Files:**
- Modify: `apps/blackberry/package.json`
- Create: `apps/blackberry/vitest.config.ts`
- Create: `apps/blackberry/vitest.setup.ts`
- Create: `apps/blackberry/src/components/schedule-content.ts`
- Create: `apps/blackberry/src/components/schedule.tsx`
- Test: `apps/blackberry/src/components/schedule.test.tsx`

**Interfaces:**
- Consumes: `Reveal` from `@mocha/ui` — `Reveal({ children: ReactNode; trigger?: "viewport" |
  "mount"; distanceY?: number; duration?: number; delay?: number })`, default `trigger:
  "viewport"`.
- Produces (for Task 2 and Task 3):
  - `apps/blackberry/vitest.config.ts` / `vitest.setup.ts` / the `"test"` script in
    `package.json` — the Vitest toolchain Task 2's test file also runs under.
  - `Schedule` — a zero-prop component, `export function Schedule(): JSX.Element`, from
    `apps/blackberry/src/components/schedule.tsx`.
  - `SCHEDULE_EVENTS: ScheduleEvent[]`, `SCHEDULE_EYEBROW: string`, `SCHEDULE_HEADING: string`,
    `SCHEDULE_INTRO: string`, and `type ScheduleEvent = { day: string; dayColor: "mauve" |
    "terracotta"; time: string; title: string; description: string }`, from
    `apps/blackberry/src/components/schedule-content.ts`.

- [ ] **Step 1: Add Vitest devDependencies and a `test` script to `apps/blackberry/package.json`**

Edit `apps/blackberry/package.json`. Add `"test": "vitest run"` to `"scripts"`, and add these
entries to `"devDependencies"` (versions match `packages/ui/package.json` exactly, for
consistency across the workspace):

```json
    "@testing-library/jest-dom": "^7.0.1",
    "@testing-library/react": "^16.3.2",
    "@vitejs/plugin-react": "^6.0.5",
    "jsdom": "^30.0.1",
    "vitest": "^4.1.11"
```

The full `scripts` block becomes:

```json
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "typegen": "next typegen"
  },
```

- [ ] **Step 2: Install dependencies**

Run: `pnpm install` (from repo root)
Expected: lockfile updates, no errors.

- [ ] **Step 3: Create the Vitest config**

Create `apps/blackberry/vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

- [ ] **Step 4: Create the Vitest setup file**

Create `apps/blackberry/vitest.setup.ts` (identical to `packages/ui/vitest.setup.ts` — the
`matchMedia` polyfill is needed for `Reveal`'s `useReducedMotion()` check, and the
`IntersectionObserver` polyfill is needed for `Reveal`'s `whileInView` viewport trigger, both of
which jsdom does not implement):

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

if (!window.IntersectionObserver) {
  window.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
  } as unknown as typeof IntersectionObserver;
}
```

- [ ] **Step 5: Create the Schedule content data file**

Create `apps/blackberry/src/components/schedule-content.ts`:

```ts
export type ScheduleEvent = {
  day: string;
  dayColor: "mauve" | "terracotta";
  time: string;
  title: string;
  description: string;
};

export const SCHEDULE_EYEBROW = "The Weekend";
export const SCHEDULE_HEADING = "Schedule of Events";
export const SCHEDULE_INTRO =
  "Three days in the North Georgia foothills. Here's the rhythm of the weekend — come to what you can, and don't stress the details. Final times will be confirmed closer to the date.";

export const SCHEDULE_EVENTS: ScheduleEvent[] = [
  {
    day: "Friday · October 1",
    dayColor: "mauve",
    time: "6:00 PM",
    title: "Welcome Party",
    description:
      "Kick things off with drinks, bites & live music on the Villa patio under the bistro lights. Casual — come as you are.",
  },
  {
    day: "Saturday · October 2 · The Big Day",
    dayColor: "terracotta",
    time: "4:00 PM",
    title: "Ceremony",
    description:
      'We say "I do" in the garden by the fountain. Please arrive by 3:30 to find your seat.',
  },
  {
    day: "Saturday · October 2 · The Big Day",
    dayColor: "terracotta",
    time: "5:00 PM",
    title: "Cocktail Hour",
    description:
      "Signature cocktails & hors d'oeuvres on the patio while we sneak away for photos.",
  },
  {
    day: "Saturday · October 2 · The Big Day",
    dayColor: "terracotta",
    time: "6:30 PM",
    title: "Reception",
    description:
      "Dinner, toasts, cake & dancing in the Grand Hall until we send the night off at 11:00.",
  },
  {
    day: "Sunday · October 3",
    dayColor: "mauve",
    time: "10:00 AM",
    title: "Farewell Brunch",
    description:
      "One more cup of coffee together before you head home. Drop by the Villa any time before noon.",
  },
];
```

- [ ] **Step 6: Write the failing test for `Schedule`**

Create `apps/blackberry/src/components/schedule.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Schedule } from "./schedule";
import { SCHEDULE_EVENTS } from "./schedule-content";

describe("Schedule", () => {
  it("renders every event's time, title, and description", () => {
    render(<Schedule />);
    for (const event of SCHEDULE_EVENTS) {
      expect(screen.getByText(event.time)).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 3, name: event.title })).toBeInTheDocument();
      expect(screen.getByText(event.description)).toBeInTheDocument();
    }
  });

  it("renders exactly one day badge per distinct day, collapsing same-day events", () => {
    render(<Schedule />);
    expect(screen.getByText("Friday · October 1")).toBeInTheDocument();
    expect(screen.getByText("Sunday · October 3")).toBeInTheDocument();
    expect(screen.getAllByText("Saturday · October 2 · The Big Day")).toHaveLength(1);
  });
});
```

- [ ] **Step 7: Run the test to verify it fails**

Run: `pnpm --filter @mocha/blackberry test`
Expected: FAIL — `Cannot find module './schedule'` (the component doesn't exist yet).

- [ ] **Step 8: Implement `Schedule`**

Create `apps/blackberry/src/components/schedule.tsx`:

```tsx
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
```

Layout notes for the implementer: the vertical line is one absolutely-positioned div spanning
the full timeline's height, pinned to `left-4` (mobile) / `left-1/2` (`md:` and up). Each event
row is a two-column CSS grid on desktop (`md:grid-cols-2`) — a "left" event's card renders in
the first (implicit) column, a "right" event's card gets `md:col-start-2`, so the gap between
columns lines up with the center line. On mobile the grid is inactive and every card sits in a
single left-aligned column (`pl-10`) next to the line. The dot (`absolute left-4 ... md:left-1/2`)
sits on the line at a fixed vertical offset within each row, independent of which side the card
is on. Day badges render as their own centered block above the first event of each new `day`
value — comparing `SCHEDULE_EVENTS[index - 1].day` to the current event's `day`, not any stored
grouping field.

- [ ] **Step 9: Run the test to verify it passes**

Run: `pnpm --filter @mocha/blackberry test`
Expected: PASS (2 tests).

- [ ] **Step 10: Commit**

```bash
git add apps/blackberry/package.json pnpm-lock.yaml apps/blackberry/vitest.config.ts apps/blackberry/vitest.setup.ts apps/blackberry/src/components/schedule-content.ts apps/blackberry/src/components/schedule.tsx apps/blackberry/src/components/schedule.test.tsx
git commit -m "feat(blackberry): add Schedule of Events section

Sets up Vitest + Testing Library for apps/blackberry (mirroring
packages/ui's config) and adds the #schedule timeline."
```

---

### Task 2: Wedding Party section

**Files:**
- Create: `apps/blackberry/src/components/party-content.ts`
- Create: `apps/blackberry/src/components/party.tsx`
- Test: `apps/blackberry/src/components/party.test.tsx`

**Interfaces:**
- Consumes: `Reveal` from `@mocha/ui` (same signature as Task 1). The Vitest toolchain from Task
  1 (`vitest.config.ts`, `vitest.setup.ts`, the `"test"` script) — no changes needed to any of
  it, this task's test file runs under the existing config automatically.
- Produces (for Task 3):
  - `Party` — a zero-prop component, `export function Party(): JSX.Element`, from
    `apps/blackberry/src/components/party.tsx`.
  - `PARTY_MEMBERS: PartyMember[]`, `PARTY_EYEBROW: string`, `PARTY_HEADING: string`,
    `PARTY_INTRO: string`, and `type PartyMember = { name: string; role: string; for: "Liane" |
    "Peyton" }`, from `apps/blackberry/src/components/party-content.ts`.

- [ ] **Step 1: Create the Party content data file**

Create `apps/blackberry/src/components/party-content.ts`:

```ts
export type PartyMember = {
  name: string;
  role: string;
  for: "Liane" | "Peyton";
};

export const PARTY_EYEBROW = "By Our Side";
export const PARTY_HEADING = "The Wedding Party";
export const PARTY_INTRO =
  "The people who've had our backs long before this weekend — and who'll be standing with us when it counts.";

export const PARTY_MEMBERS: PartyMember[] = [
  { name: "Maya Chen", role: "Maid of Honor", for: "Liane" },
  { name: "Priya Anand", role: "Bridesmaid", for: "Liane" },
  { name: "Sofia Reyes", role: "Bridesmaid", for: "Liane" },
  { name: "Grace Okoro", role: "Bridesmaid", for: "Liane" },
  { name: "Daniel Cole", role: "Best Man", for: "Peyton" },
  { name: "Marcus Webb", role: "Groomsman", for: "Peyton" },
  { name: "Eli Nakamura", role: "Groomsman", for: "Peyton" },
  { name: "Theo Brandt", role: "Groomsman", for: "Peyton" },
];
```

- [ ] **Step 2: Write the failing test for `Party`**

Create `apps/blackberry/src/components/party.test.tsx`. Roles ("Bridesmaid", "Groomsman") and
"For Liane"/"For Peyton" lines repeat across members, so each card is queried by its unique name
first via `getByRole("article", { name })`, then scoped with `within()` to avoid ambiguous
multi-match queries:

```tsx
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Party } from "./party";
import { PARTY_MEMBERS } from "./party-content";

describe("Party", () => {
  it("renders a card for every member with their name, role, and For line", () => {
    render(<Party />);
    for (const member of PARTY_MEMBERS) {
      const card = screen.getByRole("article", { name: member.name });
      expect(within(card).getByText(member.role)).toBeInTheDocument();
      expect(within(card).getByText(`For ${member.for}`)).toBeInTheDocument();
    }
  });

  it("renders initials for every member's avatar placeholder", () => {
    render(<Party />);
    expect(screen.getByText("MC")).toBeInTheDocument(); // Maya Chen
    expect(screen.getByText("PA")).toBeInTheDocument(); // Priya Anand
    expect(screen.getByText("SR")).toBeInTheDocument(); // Sofia Reyes
    expect(screen.getByText("GO")).toBeInTheDocument(); // Grace Okoro
    expect(screen.getByText("DC")).toBeInTheDocument(); // Daniel Cole
    expect(screen.getByText("MW")).toBeInTheDocument(); // Marcus Webb
    expect(screen.getByText("EN")).toBeInTheDocument(); // Eli Nakamura
    expect(screen.getByText("TB")).toBeInTheDocument(); // Theo Brandt
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm --filter @mocha/blackberry test`
Expected: FAIL — `Cannot find module './party'` (the component doesn't exist yet). The
`schedule.test.tsx` tests from Task 1 continue to pass.

- [ ] **Step 4: Implement `Party`**

Create `apps/blackberry/src/components/party.tsx`:

```tsx
import { Reveal } from "@mocha/ui";

import { PARTY_EYEBROW, PARTY_HEADING, PARTY_INTRO, PARTY_MEMBERS } from "./party-content";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

const STAGGER_STEP = 0.085;
const STAGGER_COLUMNS = 4;

export function Party() {
  return (
    <section id="party" className="bg-bb-blush px-6 py-24 sm:px-12">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.28em] text-bb-clay">{PARTY_EYEBROW}</p>
        </Reveal>
        <Reveal>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{PARTY_HEADING}</h2>
        </Reveal>
        <Reveal>
          <p className="mt-6 text-base text-muted">{PARTY_INTRO}</p>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
        {PARTY_MEMBERS.map((member, index) => (
          <Reveal key={member.name} delay={(index % STAGGER_COLUMNS) * STAGGER_STEP}>
            <article aria-label={member.name} className="text-center">
              <div className="mx-auto flex aspect-[3/4] w-full max-w-[180px] items-center justify-center rounded-2xl bg-bb-peach">
                <span className="font-serif text-4xl text-bb-clay">{initialsFor(member.name)}</span>
              </div>
              <p className="mt-4 font-serif text-xl">{member.name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-bb-clay">{member.role}</p>
              <p className="mt-1 font-serif text-sm italic text-muted">For {member.for}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm --filter @mocha/blackberry test`
Expected: PASS (4 tests total — 2 from `schedule.test.tsx`, 2 from `party.test.tsx`).

- [ ] **Step 6: Commit**

```bash
git add apps/blackberry/src/components/party-content.ts apps/blackberry/src/components/party.tsx apps/blackberry/src/components/party.test.tsx
git commit -m "feat(blackberry): add Wedding Party section"
```

---

### Task 3: Compose into `page.tsx` and verify

**Files:**
- Modify: `apps/blackberry/src/app/page.tsx`

**Interfaces:**
- Consumes: `Schedule` (zero-prop) from `@/components/schedule` (Task 1); `Party` (zero-prop)
  from `@/components/party` (Task 2); existing `CountdownStrip`/`SiteFooter`/`Hero`/`SiteNav`
  from `@mocha/ui` (Session 1, unchanged).
- Produces: nothing consumed by later work — this is the final composition step for this
  session's scope.

- [ ] **Step 1: Add the imports**

Edit `apps/blackberry/src/app/page.tsx`. Change:

```tsx
import { CountdownStrip, Hero, SiteFooter, SiteNav } from "@mocha/ui";

import heroPhoto from "@/assets/hero.jpeg";
```

to:

```tsx
import { CountdownStrip, Hero, SiteFooter, SiteNav } from "@mocha/ui";

import heroPhoto from "@/assets/hero.jpeg";
import { Party } from "@/components/party";
import { Schedule } from "@/components/schedule";
```

- [ ] **Step 2: Replace the placeholder comment with the two sections**

Change:

```tsx
        {/*
          Sessions 2–5 add their sections here, in this order:
          Schedule of Events, Wedding Party, Travel & Directions, Accommodations (Stay),
          Explore, Details, FAQ, RSVP.
        */}
```

to:

```tsx
        <Schedule />
        <Party />

        {/*
          Sessions 3–5 add their sections here, in this order:
          Travel & Directions, Accommodations (Stay), Explore, Details, FAQ, RSVP.
        */}
```

- [ ] **Step 3: Verify the whole repo**

Run, in order, from the repository root:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: all four pass with no errors. If any fail, fix the root cause (do not skip or weaken
a check) before proceeding.

- [ ] **Step 4: Visually verify in a browser**

Start the Blackberry dev server (`pnpm --filter @mocha/blackberry dev`, or use the project's
`run` skill if available) and open it in a browser. Scroll to `#schedule` and `#party` and
confirm:

- The Schedule timeline shows 5 events under 3 day badges (Friday, Saturday ×1 badge covering 3
  events, Sunday), alternating left/right on a desktop-width viewport, collapsing to a single
  left-aligned rail on a narrow/mobile viewport.
- Each event fades/slides in on scroll (scroll down slowly to see the reveal trigger).
- The Wedding Party grid shows 8 cards, 4 columns wide on desktop and 2 columns on mobile, each
  with an initials placeholder, name, role, and "For Liane"/"For Peyton" line, staggering in on
  scroll.
- Both sections' colors/typography look consistent with the rest of the page (cream/blush
  backgrounds, serif headings, uppercase tracked labels).

Stop the dev server when done.

- [ ] **Step 5: Commit**

```bash
git add apps/blackberry/src/app/page.tsx
git commit -m "feat(blackberry): compose Schedule and Party into the home page"
```

---

## Plan Self-Review Notes

- **Spec coverage:** every acceptance criterion in
  `docs/superpowers/specs/2026-08-21-blackberry-wedding-schedule-party-design.md` maps to a task
  above (content/typing → Task 1 & 2 Step 1; timeline layout/badges → Task 1 Step 8; party
  grid/stagger/avatars → Task 2 Step 4; `Reveal` usage and Server Component boundary → both;
  composition → Task 3; tests → Task 1/2 test steps; full verification → Task 3 Step 3).
- **Type consistency:** `ScheduleEvent`/`PartyMember` field names and the zero-prop
  `Schedule()`/`Party()` signatures are used identically everywhere they're referenced across
  Tasks 1–3.
- **No placeholders:** all code blocks are complete, runnable content — no TBD/TODO markers.
