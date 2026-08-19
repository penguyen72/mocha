# Blackberry Wedding Foundation Design

**Date:** 2026-08-19
**Status:** Approved in conversation; awaiting written-spec review
**Session:** 1 of 5 in the Blackberry wedding-site port (see
`docs/superpowers/reference/blackberry-wedding-dc-source.md` for the full source design this
port is targeting, and the parent brainstorm for how the remaining four sessions are scoped)

## Purpose

`apps/blackberry` currently renders only the Task-3 placeholder (`SiteShell`, shared with
Canton). This spec covers the first of five sessions porting a Claude Design canvas — a
complete one-page wedding site — into a real Next.js 16 implementation for Blackberry, matching
the source's colors, fonts, layout, and animations exactly.

This session (**Session 1 — Foundation**) does not build wedding content sections (Schedule,
Party, Travel, Stay, Explore, Details, FAQ, RSVP — those are Sessions 2–5). It builds what all
of them depend on:

- the design-token and typography system,
- shadcn/ui, introduced and customized to this palette,
- the shared Framer Motion primitives the source's animation patterns need,
- and the page's structural chrome: Nav, Hero, the Countdown strip, and Footer.

## Architecture principle

Everything in this session (and, by convention, in Sessions 2–5) is built as **prop-driven,
content-agnostic structural components in `packages/ui`**, composed by `apps/blackberry` with
its real copy, imagery, and token values. No Blackberry-specific text or hex value lives inside
a shared component's source. This is what makes "similar component structure for Canton" real
rather than aspirational — when Canton eventually gets its own approved design, it reuses the
same `SiteNav`/`Hero`/`Reveal`/etc. with its own content and its own token overrides, not a
fork.

### Resolving the token-ownership tension

`packages/ui/src/styles.css` currently defines one set of neutral placeholder token values that
both apps consume as-is; `apps/canton`'s existing placeholder page (`SiteShell`) depends on
those defaults being present and unchanged. Stripping them down to bare token names with no
values — the literal reading of "shared slots, app-owned values" — would break Canton, which is
explicitly out of scope for this work.

Resolution: **`packages/ui/src/styles.css` keeps its existing neutral defaults unchanged**, and
gains a few new token slots (below) with new neutral placeholder defaults of their own — Canton
never references these new slots, so their default values cannot affect it either way.
**`apps/blackberry/src/app/globals.css` then overrides every one of these custom properties**
with Blackberry's real values, via ordinary CSS cascade (a later `:root` rule wins) — not a new
mechanism, and no change to how Canton's stylesheet resolves.

Blackberry's design also has roughly ten distinct section-background colors — an
editorial/marketing palette, not a typical app UI theme. Only the handful of tokens shadcn
components and the Session-1 structural components actually need go into the **shared**
contract. The rest of Blackberry's palette is defined as Blackberry-local CSS custom properties,
used directly by Blackberry's own section components — not part of the shared token contract,
since it's this specific site's brand palette rather than a reusable UI slot.

## Design tokens

### New shared slots in `packages/ui/src/styles.css`

Added alongside the existing `--site-background`, `--site-surface`, `--site-foreground`,
`--site-muted`, `--site-border`, `--site-font-sans` (all unchanged):

```css
--site-primary: var(--site-foreground);            /* neutral default: same as ink */
--site-primary-foreground: var(--site-surface);    /* neutral default: same as surface */
--site-font-serif: Georgia, "Times New Roman", serif;
--site-font-script: cursive;
--site-inverted-background: #1a1a1a;                /* neutral default dark section bg */
--site-inverted-foreground: #ffffff;
```

`SiteFooter` needs a dark section background distinct from the ink/foreground tone used for
body text (the source's footer is pure black, not the ink-brown used for copy) — hence the
separate `inverted-background`/`inverted-foreground` pair, rather than reusing `foreground`.

And in the existing `@theme inline` block, add:

```css
--color-primary: var(--site-primary);
--color-primary-foreground: var(--site-primary-foreground);
--font-serif: var(--site-font-serif);
--font-script: var(--site-font-script);
--color-inverted-background: var(--site-inverted-background);
--color-inverted-foreground: var(--site-inverted-foreground);
```

### Blackberry overrides — `apps/blackberry/src/app/globals.css`

Shared-slot overrides (real values, applied after the `@mocha/ui/styles.css` import):

```css
--site-background: #FBF6F1;
--site-surface: #FBF6F1;
--site-foreground: #4A3B35;
--site-muted: #7A675E;
--site-border: #E7D6C9;
--site-primary: #D6866B;
--site-primary-foreground: #ffffff;
--site-font-sans: 'Jost', sans-serif;
--site-font-serif: 'Cormorant Garamond', serif;
--site-font-script: 'Pinyon Script', cursive;
--site-inverted-background: #000000;
--site-inverted-foreground: #ffffff;
```

Blackberry-local palette (not part of the shared contract; used directly by Blackberry's
section components — this session defines the full set now, even though Session 1's own
components only consume a subset, so Sessions 2–4 have one documented source instead of each
hardcoding hex strings ad hoc):

```css
--bb-clay: #B2795E;
--bb-terracotta: #D6866B;   /* same value as --site-primary, kept as a named alias for
                                sections that reason about "terracotta" rather than "primary" */
--bb-peach: #F2C7B4;
--bb-blush: #F4E9E0;
--bb-mauve: #C3A6A8;
--bb-line: #E7D6C9;         /* same value as --site-border */
--bb-ink-black: #000000;
```

`body` also sets `font-weight: 300;` (Jost's default weight in the source) and the Google Fonts
`<link>` tags (Cormorant Garamond 400/500/600, Jost 300/400/500, Pinyon Script) are added to
`apps/blackberry/src/app/layout.tsx`.

## shadcn/ui & Framer Motion

- Run the shadcn CLI against `packages/ui` (it supports pnpm workspaces and Tailwind v4's
  CSS-first config directly). This produces `packages/ui`'s `components.json`, a `cn()` helper
  (`clsx` + `tailwind-merge`) in `packages/ui/src/lib/utils.ts`, and component source under
  `packages/ui/src/components/ui/`.
- Add only `Button` this session. Every button in the source design shares one treatment — pill
  shaped, uppercase, letter-spaced — so the default `Button` variant is restyled to match that
  directly, rather than adding a new variant name. `ghost`/`outline`/`link` stay available,
  reskinned to the token palette, for future need — `destructive` is left out entirely for now
  (see the token note below: it needs its own token this session doesn't add), and can be added
  in whichever future session first needs it. Sessions 3–5 add `Tabs`, `Accordion`, and `Form`
  themselves when they need them.
- shadcn's CLI normally scaffolds its own full default token set (`--secondary`, `--accent`,
  `--destructive`, `--input`, `--ring`, `--radius`, etc.) using unprefixed names, which doesn't
  match this repo's existing `--site-*` → `@theme inline` → `--color-*` convention. Don't adopt
  shadcn's default scaffold wholesale: only wire up the `primary`/`primary-foreground` pair
  through the existing convention (above), since the default `Button` variant is the only one
  this session actually renders (Nav CTA, Hero CTA). Leave `secondary`/`accent`/`destructive`/
  `input`/`ring` unadded until a session actually needs the variant that uses them — YAGNI,
  and it avoids two parallel, half-populated token systems.
- Add Framer Motion as a `packages/ui` dependency (not peer — it's an implementation detail of
  `Reveal`, not something apps need to know about directly).
- This session's use of `AGENTS.md`'s boundary rule — "do not introduce ... a component suite
  without an approved design" — is satisfied by this spec. As part of this session's work,
  update that line in `AGENTS.md` to reflect that shadcn/ui is now approved and where it lives.

## Components

All in `packages/ui/src/components/`, all prop-driven — no Blackberry copy inside any of them.

### `Reveal` (client)

Wraps `motion.div`. Covers both animation patterns in the source with one primitive:

```ts
type RevealProps = {
  children: ReactNode;
  trigger?: "viewport" | "mount"; // default "viewport"
  distanceY?: number;             // default 30 (scroll-reveal); hero uses 24
  duration?: number;              // default 1 (seconds); hero uses 1.1
  delay?: number;                 // default 0; used for stagger
};
```

- `"viewport"`: Framer Motion's own `whileInView`, `viewport={{ once: true, amount: 0.12,
  margin: "0px 0px -8% 0px" }}` — SSR-safe by construction (renders hidden on the server, only
  observes once mounted).
- `"mount"`: animates immediately on mount, for the hero cascade.
- Both use easing `[0.2, 0.8, 0.2, 1]`, matching the source's `cubic-bezier(.2,.8,.2,1)`.
- Checks Framer Motion's `useReducedMotion()`; when set, skips straight to the final visible
  state instead of animating. (Not present in the source; added as a standard accessibility
  practice since it's low-cost here.)

### `SiteNav` (client — owns scroll state and mobile-menu open state)

```ts
type SiteNavProps = {
  brand: ReactNode;
  links: { label: string; href: string }[];
  cta: { label: string; href: string };
  scrollThreshold?: number;   // fraction of viewport height; default 0.7
  mobileBreakpoint?: number;  // px; default 860
};
```

Fixed position; background/blur/text-color crossfade once scrolled past `scrollThreshold`;
animated height-dropdown mobile menu below `mobileBreakpoint` (its own Framer Motion handling —
not routed through `Reveal`, since it's a distinct animation concern).

### `Hero` (server — no state of its own)

```ts
type HeroProps = {
  eyebrow: ReactNode;
  heading: ReactNode;      // e.g. "Liane" + a styled script "&" + "Peyton", composed by the app
  dateLabel: ReactNode;
  locationLabel: string;
  cta: { label: string; href: string };
  backgroundImage: { src: StaticImageData; alt: string };
  scrollCueLabel?: string; // default "Scroll"
};
```

Wraps its elements in `Reveal trigger="mount"` with the source's per-index stagger delay
(`250ms + i*220ms`). No `"use client"` needed on `Hero` itself — its only interactivity lives in
the client `Reveal` children.

### `CountdownStrip` (client — ticks every second)

```ts
type CountdownStripProps = {
  tagline: ReactNode;
  targetDate: string; // ISO 8601
  labels?: { days: string; hours: string; minutes: string; seconds: string };
  // defaults: Days / Hours / Minutes / Seconds
};
```

Computes its first real value inside `useEffect` (client-only), not during SSR, to avoid a
hydration mismatch between server-render time and client-mount time. Floors every unit at zero
once the target has passed.

### `SiteFooter` (server, static)

```ts
type SiteFooterProps = {
  heading: ReactNode;
  subline: string;
  tagline: string;
};
```

## Assets

The hero background is a real photo, not a placeholder. Pull `assets/hero.jpeg` from the Claude
Design project (`b65c3d68-cdf2-4e73-bc96-fcbafc18d737`) via the `claude_design` MCP tool (auth:
`/design-login`) and bring it in as a static import — e.g. `apps/blackberry/src/assets/hero.jpeg`
— rather than `public/`, so `next/image` generates the blur placeholder and infers dimensions
automatically.

## Error handling & edge cases

- **Countdown past the target**: floor at zero rather than going negative (matches the source's
  `Math.max(0, target - now)`).
- **Countdown SSR/hydration**: first real value computed client-side only, in `useEffect` (see
  `CountdownStrip` above) — avoids a hydration warning from server/client "now" skew.
- **`prefers-reduced-motion`**: `Reveal` renders the final visible state immediately when set,
  rather than animating (see `Reveal` above).
- **Viewport-triggered reveal**: Framer Motion's `whileInView` is SSR-safe by construction — no
  hand-rolled `IntersectionObserver` needed.
- Hero's background image is a build-time static import, so there's no runtime image-load
  failure mode beyond providing correct `alt` text.

## Testing

Vitest + Testing Library, behavior over snapshots, following the existing
`site-shell.test.tsx` pattern:

- `Reveal`: renders children under both trigger modes; respects `prefers-reduced-motion` (mock
  the hook, assert no animation delay applied).
- `SiteNav`: mobile menu opens/closes on burger click; renders the links/cta it's given via
  props (proving the shared-component contract, not hardcoded copy).
- `CountdownStrip`: using fake timers — ticks correctly, zero-pads, floors at zero past the
  target.
- `Hero` / `SiteFooter`: render tests confirming supplied content appears (static/server
  components — no interaction to test).

## Non-goals for this session

- Any wedding content section other than Hero/Nav/Countdown/Footer (Schedule, Party, Travel,
  Stay, Explore, Details, FAQ, RSVP — Sessions 2–5).
- Any change to `apps/canton` or its use of `SiteShell`.
- `Tabs`, `Accordion`, or `Form` shadcn components (added by the sessions that need them).
- Real RSVP persistence or any other backend concern (Session 5's territory, and explicitly
  flagged there as an open question rather than an assumption).

## Acceptance criteria

1. `packages/ui/src/styles.css` gains the new token slots above with neutral defaults; Canton's
   existing `SiteShell` test still passes unmodified.
2. `apps/blackberry/src/app/globals.css` overrides every shared slot with Blackberry's real
   values, plus defines the Blackberry-local palette custom properties.
3. shadcn/ui is set up in `packages/ui` with a restyled `Button`; `AGENTS.md`'s component-suite
   boundary note is updated to record the decision.
4. `Reveal`, `SiteNav`, `Hero`, `CountdownStrip`, and `SiteFooter` exist in `packages/ui`,
   fully prop-driven, each with passing tests per the Testing section.
5. `apps/blackberry/src/app/page.tsx` composes `SiteNav` + `Hero` + `CountdownStrip` +
   `SiteFooter` with Blackberry's real copy and the real hero photo, with an obvious, clearly
   marked composition point left for Sessions 2–5's sections between the countdown strip and the
   footer.
6. `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` all pass from the repo root
   (under Node 24.x).

## References

- `docs/superpowers/reference/blackberry-wedding-dc-source.md` — full extracted source design
- Claude Design project: `b65c3d68-cdf2-4e73-bc96-fcbafc18d737`, file `Wedding.dc.html`
- `docs/superpowers/specs/2026-08-18-turborepo-wedding-sites-design.md` — the boilerplate this
  builds on
