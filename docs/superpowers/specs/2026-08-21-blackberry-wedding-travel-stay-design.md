# Blackberry Wedding Travel & Stay Design

**Date:** 2026-08-21
**Status:** Approved in conversation; awaiting written-spec review
**Session:** 3 of 5 in the Blackberry wedding-site port (see
`docs/superpowers/reference/blackberry-wedding-dc-source.md` for the full source design this
port is targeting)

## Purpose

This session ports sections 6 and 7 of the source design into `apps/blackberry`:

- **Travel & Directions** (`#travel`) — a two-column layout: an icon list (By air / By car /
  Shuttle) beside a venue photo with an overlapping address card.
- **Accommodations / Stay** (`#stay`) — a dark section with an "On the Estate" / "Downtown
  Chattanooga" tab switch, each tab showing a 4-card hotel grid.

It depends on Session 1 (foundation — merged to `main`), which built the design-token system,
shadcn/ui setup, the `Reveal` Framer Motion primitive, and the page's structural chrome
(`SiteNav`, `Hero`, `CountdownStrip`, `SiteFooter`), all in `packages/ui`.

## Dependency note: Session 2 has not merged yet

The originating brief assumed Session 2 (Schedule of Events + Wedding Party) had already merged
and that this session's sections would compose after it. As of this session, `main` only has
Session 1's foundation — `apps/blackberry/src/app/page.tsx` still carries Session 1's original
placeholder comment with nothing built underneath it. This session inserts Travel and Stay
directly after `CountdownStrip` and updates that comment to make the intended final order
explicit, so that whichever session (2, 4, or 5) merges next has an unambiguous, small diff to
resolve rather than a guessing game:

```
CountdownStrip
<!-- Session 2 inserts Schedule + Party here -->
Travel   (this session)
Stay     (this session)
<!-- Sessions 4–5 insert Explore, Details, FAQ, RSVP here -->
SiteFooter
```

## Architecture

### New shared primitive — `packages/ui`

`Tabs` (shadcn/Radix), added the same way Session 1 added `Button`: via
`pnpm dlx shadcn@latest add tabs` against `packages/ui`, with the CLI's `@/`-prefixed imports
converted to relative paths per `AGENTS.md`. Restyled to the source's tab-group motion pattern
(instant background/border/text-color swap on selection, no motion beyond the color transition):
active `TabsTrigger` = `bg-primary text-primary-foreground` (terracotta/white), inactive =
transparent with a `border-border` outline. Pill-shaped to match the rest of the design's button
language. Exported from `packages/ui/src/index.ts` (`Tabs`, `TabsList`, `TabsTrigger`,
`TabsContent`, plus their prop types). Fully content-agnostic — no Blackberry copy, no
Blackberry-only styling beyond the token-driven classes already in play for `Button`.

This is the only new shared component. Session 4's Explore section (Chattanooga/Atlanta tabs)
imports these same four exports directly — no wrapper component is needed since shadcn's `Tabs`
composition primitives are already the right level of reuse.

### Blackberry-local, content-colocated — `apps/blackberry/src/components/`

Session 2's already-written spec (`2026-08-21-blackberry-wedding-schedule-party-design.md`,
committed to `main` ahead of this one) established a concrete convention for this exact
instruction — content colocated in a **sibling `*-content.ts` file** next to a flat, per-section
`*.tsx` layout component (`schedule.tsx` + `schedule-content.ts`, `party.tsx` +
`party-content.ts`), both living flat under `src/components/` with no shared `content.ts`. Since
Travel and Stay will sit in the same directory, get reviewed alongside Schedule/Party, and were
written to satisfy the identical instruction from the same brief, this session follows that
precedent rather than inventing a second colocation style:

- **`travel-content.ts`** — typed consts: eyebrow, heading, body, the 3-item icon list, and the
  address lines.
- **`travel.tsx`** (Server Component, named export `Travel`). Imports its content from
  `travel-content.ts` and renders the full `#travel` section markup directly (not a generic
  `packages/ui` component) — this section's two-column icon-list-plus-photo-card layout is
  specific enough to this page that pushing it into `packages/ui` today would be speculative
  reuse with no second consumer, mirroring Session 2's reasoning for `Schedule`/`Party`.
- **`stay-content.ts`** — typed consts: eyebrow, heading, body, and both hotel arrays (On the
  Estate / Downtown Chattanooga, 4 rows each).
- **`stay.tsx`** (Server Component, named export `Stay`). Imports the eyebrow/heading/body
  consts and renders the dark section wrapper around `<StayTabs />`.
- **`stay-tabs.tsx`** (`"use client"`, named export `StayTabs`). The tab-switch interactive
  boundary — the only client component this session adds. Imports both hotel arrays from
  `stay-content.ts` and renders `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` from `@mocha/ui`
  around a 4-card grid per tab.

`apps/blackberry/src/app/page.tsx` imports `Travel` from `@/components/travel` and `Stay` from
`@/components/stay` (the `@/*` → `./src/*` alias already configured in
`apps/blackberry/tsconfig.json`) and renders `<Travel />` then `<Stay />` with no props, right
after `<CountdownStrip />`.

This keeps `packages/ui` limited to the one genuinely reusable addition (`Tabs`), keeps the
Server/Client boundary narrow (only `stay-tabs.tsx` is a client component, per instruction #5),
and keeps every session's footprint in the shared `page.tsx` file to two lines (one import, one
JSX element) per section — minimizing merge conflicts with Sessions 2, 4, and 5 working the same
file around the same time.

## Travel & Directions (`#travel`)

- Section background: `--site-background` (cream) — matches Schedule/Explore/FAQ per the
  reference doc's palette table.
- Eyebrow "Getting Here" (`clay` color, uppercase, letter-spaced), H2 "Travel & Directions"
  (serif), body: "The Villa at Blackberry Ridge sits in the foothills of Trenton, Georgia —
  tucked between Chattanooga and Atlanta. It's an easy drive from either, and the countryside on
  the way is half the fun." All wrapped in `Reveal` (`trigger="viewport"`, default settings).
- Two-column grid below (`grid-cols-1 lg:grid-cols-2`, stacks on mobile):
  - **Left — icon list**, 3 rows, each `Reveal`-wrapped with `delay: index * 0.08` (80ms per
    row, linear since this is a single column rather than a wrapping grid — the source's `(i %
    n) * ~80-90ms` stagger only applies to multi-column grids): a circle (`bg-bb-peach`)
    containing a literal Unicode glyph, a title, and a description:

    | Glyph | Title | Description |
    | --- | --- | --- |
    | ✈ | By air | "Chattanooga (CHA) is 45 min away; Atlanta (ATL) is ~2 hrs and has more direct flights. Rental car recommended either way." |
    | ⌁ | By car | "Just off Hwy 301 in Trenton, GA. Free on-site parking — carpooling encouraged for the welcome party." |
    | ✦ | Shuttle | "A shuttle will run between the downtown Chattanooga hotel block and the Villa on Saturday. Details to come." |

  - **Right — photo + address card**: a placeholder photo block (see Placeholders below) sized
    to the source's venue-photo aspect ratio, with an absolutely-positioned white card
    overlapping its lower edge: "625 Hwy 301 S" / "Trenton, GA 30752". `Reveal`-wrapped as one
    unit.

## Accommodations / Stay (`#stay`)

- Section background: `--color-inverted-background` (pure black), text `--color-inverted-foreground`
  (white) — the same token pair `SiteFooter` already uses.
- Eyebrow "Where to Stay" (`peach` color), H2 "Accommodations" (white serif), body: "Make a
  weekend of it. Stay right on the estate, or settle into downtown Chattanooga (about 30 minutes
  north). Mention the Liane & Peyton wedding block when you book." `Reveal`-wrapped.
- `StayTabs`: `Tabs` defaulting to the "On the Estate" value. Two `TabsTrigger`s: "On the Estate"
  / "Downtown Chattanooga", styled per the Architecture section above. Each `TabsContent` renders
  a `grid-cols-1 md:grid-cols-4` grid of 4 hotel cards, `Reveal`-wrapped with `(i % 4) * ~85ms`
  stagger delay. Each card: placeholder photo block, small uppercase tag label (`clay`/`peach`
  tone), serif name, description.

  **On the Estate:**

  | Tag | Name | Description |
  | --- | --- | --- |
  | On-site · Flagship | Yorkshire Manor | "The grand manor on the estate — the heart of our room block. Sleeps a large group with elegant shared spaces." |
  | On-site | Cotswold Manor | "A second European-style manor steps from the Villa. Warm, characterful rooms for family and close friends." |
  | On-site · Suite | Blackberry Tower | "A private 3-bedroom tower tucked in the trees with a lakeside dock — sleeps up to 8." |
  | On-site · Cozy | The Cottage | "A charming garden cottage for a quiet, romantic stay right on the grounds." |

  **Downtown Chattanooga:**

  | Tag | Name | Description |
  | --- | --- | --- |
  | ~30 min · Historic | The Read House | "A 1920s downtown landmark near the Tennessee Aquarium. Our recommended hotel block — timeless and central." |
  | ~30 min · Modern | The Westin Chattanooga | "Rooftop bar with Lookout Mountain views, heated pool, and boutique shopping in the West Village." |
  | ~30 min · Boutique | Hotel Indigo Downtown | "A stylish boutique stay in the heart of downtown, walkable to the riverfront and restaurants." |
  | ~30 min · B&B | Mayor's Mansion Inn | "An 1889 mansion turned intimate bed & breakfast in the Fort Wood historic district. Romantic and quiet." |

  Radix's `Tabs` unmounts inactive `TabsContent` by default, so switching tabs remounts the
  grid, and each card's `Reveal` (`whileInView`, `once: true`) fires again as a fresh mount —
  reproducing the source's "switching a tab re-triggers the scroll-reveal stagger" behavior with
  no extra plumbing beyond the default Radix/Framer Motion behavior.

## Placeholders (photos)

Neither the venue photo nor any of the 8 hotel photos are real assets in the design source. Per
this session's decision: all 9 photo slots render as CSS gradient blocks using the existing
`bb-blush`/`bb-peach` tokens, sized to the aspect ratios the source's photos use, with a short
comment marking each as a placeholder pending real photography. No `next/image` remote config,
no external requests, no new dependency — swapping in a real photo later is a one-line change
per slot (replacing the placeholder `div` with an `Image`).

## Icons

The By air / By car / Shuttle icons render as literal Unicode glyphs (✈, ⌁, ✦) inside a
`bg-bb-peach` circle, matching the source exactly. No icon library is added — nothing in the
repo currently depends on one, and the source itself doesn't use one either.

## Error handling & edge cases

- No client-only state beyond the `Tabs` primitive's own selection state (no timers, no network
  calls, no hydration-sensitive values) — no SSR/hydration mismatch risk in this session's work,
  unlike `CountdownStrip`.
- `prefers-reduced-motion` is already handled inside the shared `Reveal` primitive (Session 1);
  this session's `Reveal` usages inherit that behavior for free.
- Tab keyboard navigation, focus management, and ARIA roles (`tablist`/`tab`/`tabpanel`) come
  from Radix's `Tabs` primitive — no hand-rolled accessibility logic needed.

## Testing

Following Session 1's precedent: `packages/ui` components are unit-tested (Vitest + Testing
Library); `apps/blackberry`'s composition layer is not (there is currently no vitest config or
`test` script in `apps/blackberry/package.json`, and `page.tsx` itself has never had a test
file). This session does not add a vitest setup to `apps/blackberry`, since `travel.tsx`,
`stay.tsx`, and `stay-tabs.tsx` are content composition around already-tested primitives, not
new branching logic of their own.

`packages/ui/src/components/ui/tabs.test.tsx` (new, following `button.test.tsx`'s pattern):

- Renders with the first tab's content visible by default.
- Clicking the second `TabsTrigger` switches the visible `TabsContent` to the second panel's
  content (and hides the first, given Radix's default unmount-when-inactive behavior).
- Renders proper ARIA roles (`tablist`, `tab`, `tabpanel`) and marks the active tab
  `aria-selected="true"`.

## Non-goals for this session

- Nav, Hero, Countdown, Footer (Session 1 — already merged).
- Schedule of Events, Wedding Party (Session 2 — not yet merged; see the dependency note above).
- Explore, Details, FAQ (Session 4).
- RSVP (Session 5).
- Real venue/hotel photography (flagged above as a content gap; placeholders only).
- Any change to `apps/canton`.

## Acceptance criteria

1. `packages/ui` gains a restyled `Tabs` (shadcn/Radix) component, exported from
   `packages/ui/src/index.ts`, with passing tests per the Testing section above.
2. `apps/blackberry/src/components/travel-content.ts` and `travel.tsx` render the `#travel`
   section with the exact copy, icon list, and address card specified above.
3. `apps/blackberry/src/components/stay-content.ts`, `stay.tsx`, and `stay-tabs.tsx` render the
   `#stay` section with the exact copy and both hotel tables specified above; the tab switch
   changes the visible grid.
4. `apps/blackberry/src/app/page.tsx` composes `Travel` and `Stay` (no props) directly after
   `CountdownStrip`, with an updated placeholder comment describing where Sessions 2, 4, and 5
   insert their sections relative to this one.
5. All 9 photo slots render as token-driven CSS placeholder blocks, not broken image requests.
6. `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` all pass from the repo root.

## References

- `docs/superpowers/reference/blackberry-wedding-dc-source.md` — full extracted source design
  (sections 6 and 7 are this session's scope)
- `docs/superpowers/specs/2026-08-19-blackberry-wedding-foundation-design.md` — Session 1's
  spec; source of the token system, `Reveal`, and the `Button`-via-shadcn precedent this session
  follows for `Tabs`
