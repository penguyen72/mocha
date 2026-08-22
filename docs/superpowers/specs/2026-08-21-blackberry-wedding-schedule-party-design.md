# Blackberry Wedding Schedule & Wedding Party Design

**Date:** 2026-08-21
**Status:** Approved in conversation; awaiting written-spec review
**Session:** 2 of 5 in the Blackberry wedding-site port (see
`docs/superpowers/reference/blackberry-wedding-dc-source.md` for the full source design this
port targets, and `docs/superpowers/specs/2026-08-19-blackberry-wedding-foundation-design.md`
for Session 1 — Foundation, which this session depends on and builds on)

## Purpose

Session 1 (merged to `main`) built the design-token system, shadcn/ui setup, the shared Framer
Motion `Reveal` primitive, and the page's structural chrome (`SiteNav`, `Hero`, `CountdownStrip`,
`SiteFooter`) as prop-driven, content-agnostic components in `packages/ui`.

This session adds the next two content sections of the one-page site, matching the source
design's Section 4 ("Schedule of Events") and Section 5 ("Wedding Party") exactly:

1. `#schedule` — a vertical center-line timeline of 5 events across three days, grouped by day
   badge, cards alternating left/right of the line.
2. `#party` — a responsive grid (4 cols desktop / 2 mobile) of the 8 wedding-party members.

Both are composed into `apps/blackberry/src/app/page.tsx` between `CountdownStrip` and the
composition point left for later sessions (Travel, Stay, Explore, Details, FAQ, RSVP).

## Architecture principle

Unlike Session 1's chrome components, `Schedule` and `Party` are **not** added to `packages/ui`.
Both `AGENTS.md` ("Add to `@mocha/ui` only when both applications intentionally share the visual
API") and the parent design doc ("New components enter the package only when both applications
need the same visual behavior") gate shared components on genuine cross-app reuse. Canton has no
approved design yet — there is nothing to share this visual API with today. So these are
Blackberry-local: `apps/blackberry/src/components/schedule.tsx` and `.../party.tsx`, flat under
`src/components/` (mirroring `packages/ui`'s own flat `src/components/*.tsx` layout — no
per-component subfolders).

Both are **Server Components**. Neither needs `"use client"` itself — each imports the client
`Reveal` from `@mocha/ui` and wraps pieces of otherwise-static JSX in it, the same pattern
`Hero` already uses. Content is colocated with its component in a sibling `*-content.ts` file
(`schedule-content.ts`, `party-content.ts`) rather than one shared `content.ts`, so Sessions
3–5 touching the same page in parallel don't collide on a shared data file.

Content is plain typed TypeScript consts, not Zod schemas — this is static copy fixed at build
time, not user input crossing a validation boundary, so runtime schema validation would be
unused ceremony (YAGNI, consistent with Session 1's restraint elsewhere, e.g. deferring
`Tabs`/`Accordion`/`Form` until a session actually needs them).

## Schedule of Events (`#schedule`)

### Content — `schedule-content.ts`

```ts
export type ScheduleEvent = {
  day: string;                          // day-badge label, e.g. "Friday · October 1"
  dayColor: "mauve" | "terracotta";
  time: string;
  title: string;
  description: string;
};

export const SCHEDULE_EYEBROW = "The Weekend";
export const SCHEDULE_HEADING = "Schedule of Events";
export const SCHEDULE_INTRO =
  "Three days in the North Georgia foothills. Here's the rhythm of the weekend — come to what " +
  "you can, and don't stress the details. Final times will be confirmed closer to the date.";

export const SCHEDULE_EVENTS: ScheduleEvent[] = [
  { day: "Friday · October 1", dayColor: "mauve", time: "6:00 PM", title: "Welcome Party",
    description: "Kick things off with drinks, bites & live music on the Villa patio under the " +
      "bistro lights. Casual — come as you are." },
  { day: "Saturday · October 2 · The Big Day", dayColor: "terracotta", time: "4:00 PM",
    title: "Ceremony",
    description: "We say \"I do\" in the garden by the fountain. Please arrive by 3:30 to find " +
      "your seat." },
  { day: "Saturday · October 2 · The Big Day", dayColor: "terracotta", time: "5:00 PM",
    title: "Cocktail Hour",
    description: "Signature cocktails & hors d'oeuvres on the patio while we sneak away for " +
      "photos." },
  { day: "Saturday · October 2 · The Big Day", dayColor: "terracotta", time: "6:30 PM",
    title: "Reception",
    description: "Dinner, toasts, cake & dancing in the Grand Hall until we send the night off " +
      "at 11:00." },
  { day: "Sunday · October 3", dayColor: "mauve", time: "10:00 AM", title: "Farewell Brunch",
    description: "One more cup of coffee together before you head home. Drop by the Villa any " +
      "time before noon." },
];
```

Verbatim from the reference doc's Section 4 table.

### Layout — `schedule.tsx`

Two things are **derived at render time, not stored in data**, since they're already implied by
the array's order and would otherwise duplicate it:

- **Side** (left/right): alternates by index parity (`index % 2 === 0` → left), matching the
  reference table's already-alternating left/right column.
- **Badge visibility**: a day badge renders above an event only when its `day` differs from the
  previous event's `day` — this naturally collapses the three Saturday rows under one badge.

Structure: a `relative` timeline container with an absolute centered vertical line
(`bg-bb-line`, 1px, full height). Each event is a `<Reveal>`-wrapped row containing a small
terracotta dot positioned on the line and a white card (time + title + description) offset to
its derived side with a fixed `md:w-[calc(50%-2.5rem)]`-style half-width plus gap, so alternating
cards don't touch the line. Day badges are pill-shaped, colored by `dayColor` (`bg-bb-mauve` /
`bg-bb-terracotta`), centered on the line, rendered as their own `<Reveal>`-wrapped block above
the run of events they group.

**Mobile** (below `md`): the layout collapses to a single left-aligned rail — line and dots
pinned to the left edge, cards full-width to their right — rather than preserving alternating
sides at narrow widths. This isn't spelled out in the source (which doesn't specify mobile
timeline behavior) but is the standard responsive treatment of a center-line timeline and keeps
cards legible at small widths.

Section background: no override needed — `bg-bb-cream`/`--site-background` is already the page
default per the token table ("Schedule/Travel/Explore/FAQ section bg" = cream = same as page
bg).

## Wedding Party (`#party`)

### Content — `party-content.ts`

```ts
export type PartyMember = {
  name: string;
  role: string;
  for: "Liane" | "Peyton";
};

export const PARTY_EYEBROW = "By Our Side";
export const PARTY_HEADING = "The Wedding Party";
export const PARTY_INTRO =
  "The people who've had our backs long before this weekend — and who'll be standing with us " +
  "when it counts.";

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

Verbatim from the reference doc's Section 5 table.

### Layout — `party.tsx`

Section background `bg-bb-blush` per the token table. Grid: `grid-cols-2 md:grid-cols-4` with
consistent gaps (4 desktop / 2 mobile per the reference doc; `md` is this session's chosen
breakpoint since no other structural grid breakpoint exists yet in this codebase to match).

Each member renders inside `<Reveal delay={(index % 4) * 0.085}>` — approximates the source's
`transition-delay: (i % n) * ~80-90ms` stagger without a runtime column-count detector (which
would require client-side `ResizeObserver` state — unnecessary complexity for an approximate
visual stagger the source itself only loosely specifies).

Card content, top to bottom:

1. **Avatar placeholder** — a 3:4 box, `bg-bb-peach` background, `text-bb-clay` initials in
   serif type, centered. This reuses the token doc's own documented "icon-circle bg/text" color
   pairing rather than inventing a new combination. Real party-member photos aren't available as
   assets yet (flagged as a content gap in the reference doc); swapping in real photos later is
   a one-line-per-person change (replace the initials box with a `next/image` using the same
   `PartyMember` shape plus a new `photo` field) and does not block this session.
2. **Name** — serif.
3. **Role** — uppercase, `text-bb-clay`, per the source.
4. **"For Liane" / "For Peyton"** — italic serif, driven by the `for` field.

## Composition — `page.tsx`

Import `Schedule` from `@/components/schedule` and `Party` from `@/components/party`. Replace
the existing placeholder comment between `<CountdownStrip />` and `<SiteFooter />` with:

```tsx
<Schedule />
<Party />

{/*
  Sessions 3–5 add their sections here, in this order:
  Travel & Directions, Accommodations (Stay), Explore, Details, FAQ, RSVP.
*/}
```

## Testing

Vitest + Testing Library, behavior over snapshots, matching the existing `hero.test.tsx` /
`countdown-strip.test.tsx` style:

- `schedule.test.tsx`: all 5 event titles, times, and descriptions render; exactly 3 day badges
  render with the correct grouped text (proving the dedup-by-previous-day logic collapses the
  three Saturday rows into one badge).
- `party.test.tsx`: all 8 names, roles, and "For Liane"/"For Peyton" lines render; initials
  render for each of the 8 avatar placeholders.

## Error handling & edge cases

Both sections are static content with no user input, network calls, or client-only computed
state — there are no domain error states to invent here, consistent with the parent design
doc's "no network, storage, or mutation flows … will not invent domain error states" stance.
`prefers-reduced-motion` is already handled globally by `Reveal` (Session 1) and needs no
section-specific handling.

## Non-goals for this session

- Real wedding-party photos (explicitly flagged as a content gap; placeholder avatars are this
  session's deliverable, real photos are a future content swap).
- Any other content section (Travel, Stay, Explore, Details, FAQ, RSVP — Sessions 3–5) or
  changes to Nav/Hero/Countdown/Footer (Session 1, already merged).
- Any change to `apps/canton`.
- Adding `Schedule`/`Party` (or any part of them) to `packages/ui` — Blackberry-local per the
  Architecture principle above, until a second app genuinely needs the same visual API.

## Acceptance criteria

1. `apps/blackberry/src/components/schedule-content.ts` and `party-content.ts` contain the
   verbatim copy/data above, typed, with no Zod dependency.
2. `apps/blackberry/src/components/schedule.tsx` renders the timeline with alternating
   left/right cards on desktop, a single-rail layout on mobile, a centered connecting line and
   per-event dot, and day badges colored per `dayColor` that collapse consecutive same-day
   events under one badge.
3. `apps/blackberry/src/components/party.tsx` renders an 8-member responsive grid (2 cols
   mobile / 4 cols desktop) with staggered scroll-reveal, each card showing an initials
   placeholder avatar, name, role, and "For Liane"/"For Peyton" line.
4. Both sections use `Reveal` from `@mocha/ui` for scroll-reveal/stagger and remain Server
   Components themselves.
5. `apps/blackberry/src/app/page.tsx` composes `<Schedule />` and `<Party />` between
   `CountdownStrip` and the remaining composition point, with an updated comment reflecting only
   the sections still pending (Sessions 3–5).
6. `schedule.test.tsx` and `party.test.tsx` exist and pass per the Testing section.
7. `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` all pass from the repository
   root.

## References

- `docs/superpowers/reference/blackberry-wedding-dc-source.md` — full extracted source design
  (Sections 4 and 5 are this session's scope)
- `docs/superpowers/specs/2026-08-19-blackberry-wedding-foundation-design.md` — Session 1,
  which this session depends on and reuses (`Reveal`, design tokens, `--bb-*` palette)
- `docs/superpowers/specs/2026-08-18-turborepo-wedding-sites-design.md` — the monorepo
  boilerplate both build on
