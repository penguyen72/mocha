# Blackberry Wedding Explore / Details / FAQ Design

**Date:** 2026-08-21
**Status:** Approved in conversation; awaiting written-spec review
**Session:** 4 of 5 in the Blackberry wedding-site port (see
`docs/superpowers/reference/blackberry-wedding-dc-source.md` for the full source design this
port is targeting)

## Purpose

This session ports three sections of the source design into `apps/blackberry`:

- **Explore** (`#explore`) — a two-tab switch (Chattanooga / Atlanta) with a 6-card activity grid
  per tab.
- **Details** (`#details`) — a Dress Code card and a Registry card, side by side.
- **FAQ** (`#faq`) — a 6-item single-open accordion.

It depends on **Session 1 (Foundation)**, already merged to `main`, which built the design-token
system, shadcn/ui setup (`Button` only so far), `Reveal`, `SiteNav`, `Hero`, `CountdownStrip`, and
`SiteFooter` in `packages/ui`, plus the page shell in `apps/blackberry/src/app/page.tsx`.

**Session 3 (Travel/Stay) has not merged yet** at the time of this session. Its Stay section also
needs a Chattanooga/Estate-style tab switch. Rather than let both sessions build their own, this
session builds one reusable `TabSwitch` primitive in `packages/ui` and documents it as available
for Session 3 to reuse.

Out of scope: Nav/Hero/Countdown/Footer (Session 1), Schedule/Party (Session 2), Travel/Stay
(Session 3), RSVP (Session 5).

## Architecture

Continuing the split Session 1 established:

- **Generic, content-agnostic interaction primitives** live in `packages/ui`, prop-driven, no
  Blackberry copy inside their source. This session adds shadcn's `Tabs` and `Accordion`
  (restyled to the site's palette) plus a new `TabSwitch` wrapper.
- **Blackberry-specific section components**, each colocating its own content data, live in
  `apps/blackberry/src/components/sections/` — a new directory (nothing has needed
  non-page components in the app yet). This departs from Session 1's Hero/Footer pattern
  (fully generic components in `packages/ui`, content passed from `page.tsx`) because
  Explore/Details/FAQ's card layouts and copy are intrinsically specific to this wedding, not
  reusable structural chrome — forcing them through a generic prop contract Canton would never
  use is premature abstraction, and conflicts with `AGENTS.md`'s "keep Blackberry-specific copy
  and composition in `apps/blackberry`" boundary.
- Default to Server Components. The only client boundaries are tab-switch state (`TabSwitch`,
  wrapping shadcn `Tabs`) and accordion-open state (shadcn `Accordion`) — both already
  necessarily client components via Radix.

## Components — `packages/ui`

### `Tabs` / `Accordion` (shadcn primitives, `packages/ui/src/components/ui/`)

Added via `pnpm dlx shadcn@latest add tabs accordion` run against `packages/ui` (per `AGENTS.md`'s
established shadcn convention), then:

- `@/`-prefixed imports converted to relative paths (same fixup Session 1 did for `Button`).
- Restyled to match the source's visual language instead of shadcn's defaults:
  - `Tabs`: `TabsList` becomes a pill segmented control (`rounded-full`, bordered container);
    each `TabsTrigger` is `rounded-full`, uppercase, letter-spaced, with an instant (no-motion)
    background/text-color swap on the active state — `bg-primary text-primary-foreground` active,
    transparent/muted inactive. Matches the source's "instant swap, no motion beyond a quick
    color transition" pattern for tab groups.
  - `Accordion`: `AccordionTrigger`'s default chevron is replaced with a `Plus` icon (lucide,
    already the project's icon library per `components.json`) that rotates 45° when open (via
    `data-state=open` + `transition-transform`), matching the source's "+" that becomes a "×".
    `AccordionContent` keeps Radix's built-in height animation (equivalent to the source's
    `max-height` transition).
- Both get a Vitest test alongside the existing `packages/ui` component tests (behavior, not
  snapshots): `Tabs` — switching triggers changes which panel is visible; `Accordion` — opening
  one item closes any other open item (single-open, via `type="single" collapsible`).

### `TabSwitch` (`packages/ui/src/components/tab-switch.tsx`, client)

A thin, generic wrapper around the restyled `Tabs` primitive, prop-driven so any section (this
one's Explore, and potentially Session 3's Stay) can hand it arbitrary panel content:

```ts
export type TabSwitchProps = {
  tabs: { id: string; label: string; panel: ReactNode }[];
  defaultTabId?: string; // defaults to tabs[0].id
};
```

- Renders `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` from the shadcn primitive above.
- `panel` is typically server-rendered JSX (e.g. Explore's grid) passed in from a Server
  Component — this works because passing already-rendered Server Component output as a prop
  into a Client Component is supported by the framework; `TabSwitch` never needs to know what's
  inside a panel.
- Radix `Tabs.Content` only mounts the active panel by default, so switching tabs naturally
  re-mounts the newly shown panel — which is what makes each panel's `Reveal` children replay
  their scroll-stagger animation on switch, matching the source's "switching a tab also
  re-triggers the scroll-reveal stagger on the newly shown grid" without any extra logic.
- Test: renders all tab labels; clicking a non-default tab swaps which panel's content is
  present in the DOM.

A note is left at the top of `tab-switch.tsx` (and in this spec) flagging it as available for
Session 3's Stay tab switch, so that session doesn't build a second one.

## Components — `apps/blackberry/src/components/sections/`

Each is a Server Component. Content data is a colocated `const` in the same file — no shared
`content.ts`.

### `explore-section.tsx`

```ts
type ExploreActivity = { name: string; description: string };
type ExploreTab = { id: string; label: string; activities: ExploreActivity[] };
```

- Section `id="explore"`, eyebrow "Make a Trip of It", H2 "Things to Do", intro copy (exact text
  in the reference doc §8).
- `EXPLORE_TABS`: two entries, `chattanooga` ("Chattanooga · 30 min") and `atlanta`
  ("Atlanta · 2 hrs"), each with its 6 activities from reference doc §8 (exact names/descriptions
  — Lookout Mountain, Tennessee Aquarium, Walnut Street Bridge, Bluff View Art District, Downtown
  Dining, Coolidge Park / Georgia Aquarium, Ponce City Market, The Atlanta BeltLine, Piedmont
  Park, World of Coca-Cola, Historic Sweet Auburn).
- Renders `<TabSwitch>` with each tab's `panel` being a `grid grid-cols-1 md:grid-cols-3` of
  cards. Each card: a 16:10 placeholder block (`aspect-[16/10]`, a soft gradient built from the
  site's palette tokens, e.g. `--bb-peach`→`--bb-blush`) with the activity name centered on it,
  then the activity name (heading) and description below. Wrapped per-card in `Reveal
  trigger="viewport"` with `delay={(index % 3) * 0.085}` matching the source's grid stagger.
- Per your decision: no real photos this session — the placeholder block *is* the deliverable,
  not a stopgap needing a follow-up ticket, though swapping in real photography remains a natural
  future content update whenever the couple has some.

### `details-section.tsx`

```ts
type DressCodeSwatch = string; // hex
type RegistryLink = { label: string; href: string };
```

- Section `id="details"`, `bg-bb-peach` (per reference doc §9), two cards
  (`grid grid-cols-1 md:grid-cols-2`, stacking on mobile).
- **Dress Code card**: eyebrow "What to Wear", H2 "Dress Code", "Garden Formal" emphasized line,
  body copy, five swatch chips rendered from `DRESS_CODE_SWATCHES = ["#F7DDD0", "#F2C7B4",
  "#C3A6A8", "#C79B7E", "#B2795E"]` as plain hex literals (two of the five aren't part of the
  shared `--bb-*` token set — they're single-use here per the reference doc, so a literal is
  clearer than inventing a token for a one-off value), plus the italic shoes footnote.
- **Registry card**: eyebrow "Gifts", H2 "Registry", body copy, `REGISTRY_LINKS` — three rows
  (Crate & Barrel, Zola Registry, Honeymoon Fund), each `href="#rsvp"` per your decision to keep
  the source's placeholder target until real registry URLs exist.

### `faq-section.tsx`

```ts
type FaqItem = { question: string; answer: string };
```

- Section `id="faq"`, eyebrow "Good to Know", H2 "Questions?".
- `FAQ_ITEMS`: the 6 Q&A pairs from reference doc §10, verbatim.
- Renders `<Accordion type="single" collapsible>` from `@mocha/ui`, mapping each item to an
  `AccordionItem`/`AccordionTrigger`/`AccordionContent`.

## Composition — `apps/blackberry/src/app/page.tsx`

The current placeholder comment between `CountdownStrip` and `SiteFooter` covers all of Sessions
2–5. Split it so the ordering intent is unambiguous once those sessions land:

```tsx
{/* Session 2 adds Schedule of Events and Wedding Party here. */}
{/* Session 3 adds Travel & Directions and Accommodations (Stay) here. */}

<ExploreSection />
<DetailsSection />
<FaqSection />

{/* Session 5 adds RSVP here. */}
```

This places my three sections immediately after the countdown strip (since nothing from Sessions
2/3 exists yet) while documenting the final intended order: Schedule, Party, Travel, Stay,
Explore, Details, FAQ, RSVP — matching both the source design and the existing nav link order.

## Error handling & edge cases

- **No JS / reduced motion**: `Reveal` (from Session 1) already renders the final visible state
  immediately when `prefers-reduced-motion` is set — the grid cards and section headings inherit
  this for free.
- **Tab switch with no JS**: shadcn `Tabs` renders the first tab's content in the initial HTML
  (SSR-safe via Radix); without JS, only the Chattanooga tab's grid is visible, which is an
  acceptable degradation matching how the rest of the source relies on client JS for interactive
  affordances.
- **Accordion**: `type="single" collapsible` means all 6 items can be closed at once, and opening
  one always closes any other open item — matches the source's single-open behavior exactly.
- **Placeholder photo blocks**: pure CSS (gradient + text), no image load/failure mode.
- **Registry/dress-code content**: static data, no runtime failure mode.

## Testing

Vitest + Testing Library, behavior over snapshots, following the existing `packages/ui` test
pattern (e.g. `site-nav.test.tsx`, `countdown-strip.test.tsx`):

- `Tabs`: switching the active trigger changes which `TabsContent` is present.
- `Accordion`: opening one item closes a previously open item (single-open).
- `TabSwitch`: renders all supplied tab labels; clicking a non-default tab's label swaps which
  panel's content is present in the DOM.

`apps/blackberry` gets no new test infrastructure this session — it has no `test` script today
(Session 1 didn't add one), and its three section components are thin Server Component
composition over already-tested primitives with static content, exercised by `lint`/`typecheck`/
`build` rather than Vitest.

## Non-goals for this session

- Nav/Hero/Countdown/Footer (Session 1), Schedule/Party (Session 2), Travel/Stay (Session 3),
  RSVP (Session 5).
- Real photography for the Explore cards (styled placeholder blocks are the deliverable, per
  your decision).
- Real registry URLs (placeholder `#rsvp` hrefs are the deliverable, per your decision).
- Adding Vitest to `apps/blackberry`.
- Building Session 3's actual Stay tab switch — only making `TabSwitch` available for it to reuse.

## Acceptance criteria

1. `packages/ui` gains restyled `Tabs` and `Accordion` shadcn primitives and a new `TabSwitch`
   wrapper, each with passing behavior tests per the Testing section.
2. `apps/blackberry/src/components/sections/explore-section.tsx` renders the two-tab switch with
   the reference doc's exact Chattanooga/Atlanta activity data, 3-col desktop / 1-col mobile,
   16:10 placeholder photo blocks.
3. `apps/blackberry/src/components/sections/details-section.tsx` renders the Dress Code card
   (five swatches, exact hex values) and Registry card (three rows, placeholder hrefs) side by
   side, stacking on mobile.
4. `apps/blackberry/src/components/sections/faq-section.tsx` renders a 6-item single-open
   accordion with the reference doc's exact Q&A content.
5. `apps/blackberry/src/app/page.tsx` composes all three sections between the countdown strip and
   footer, with comments marking where Sessions 2, 3, and 5 insert their own sections.
6. `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` all pass from the repository root.

## References

- `docs/superpowers/reference/blackberry-wedding-dc-source.md` — full extracted source design,
  §8 (Explore), §9 (Details), §10 (FAQ)
- `docs/superpowers/specs/2026-08-19-blackberry-wedding-foundation-design.md` — Session 1's
  foundation spec (tokens, shadcn setup, `Reveal`/`SiteNav`/`Hero`/`CountdownStrip`/`SiteFooter`)
- Claude Design project: `b65c3d68-cdf2-4e73-bc96-fcbafc18d737`, file `Wedding.dc.html`
