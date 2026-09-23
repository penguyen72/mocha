# Save the Date Application Design

**Date:** 2026-09-23
**Status:** Approved in conversation
**Source design:** `docs/superpowers/reference/save-the-date-dc-source.md`

## Purpose

Add a third independently deployed Next.js application, `apps/save-the-date`, to the Mocha
monorepo by porting the `Save the Date.dc.html` Claude Design prototype into this repo's existing
architecture and coding semantics.

The finished site must work on phones and desktops, and must read as though the same hand that
wrote `apps/blackberry` wrote it. No new architecture is invented: the app mirrors Blackberry's
config, file layout, token system, content-colocation convention, and test style.

## Scope

**In scope**

- A new workspace `@mocha/save-the-date` on dev port 3002, configured by hand from Blackberry's
  config files.
- Two routes: the invitation (`/`) and the address page (`/share-your-address`).
- The full envelope-opening choreography, ported from Web Animations API to CSS.
- The address form, with validation, and idle/sending/success/error states.
- Repository docs updated for a third app.

**Out of scope**

- Any change to `apps/canton` or `apps/blackberry` content.
- Any addition to `packages/ui`.
- A real form-submission endpoint, storage, auth, analytics, or a CMS.
- Fetching the design's Canva-hosted images.

## Architecture

### Routing — one client state machine, one real route

`HANDOFF.md` asks that the prototype's three hash routes become real paths. Two of the three are
genuinely separate pages; the third is not.

| Prototype hash | Port |
| --- | --- |
| `#/` | `/`, phase `closed` |
| `#/envelope-open` | `/`, phase `open` — addressable as `/#open` |
| `#/share-your-address` | `/share-your-address`, a real App Router route |

`closed` and `open` stay on one route because they are the *same* DOM: the opened invitation is the
same envelope with its flap laid back and its cards lifted out of the pocket. Splitting them across
routes would tear the animation's shared DOM apart for no benefit. `/share-your-address` is a real
route because it genuinely is a different page.

The `#open` hash is what lets "Back to invitation" return to the opened state:

- `/` server-renders the `closed` phase. It stays statically prerendered — no `searchParams`, so
  nothing forces dynamic rendering.
- On mount, the stage reads `location.hash`. `#open` starts it at phase `open` with no animation.
- Opening the envelope calls `history.replaceState` to set `#open`, so a mid-invitation refresh
  stays open and no extra history entry is pushed.
- The CTA is `<Link href="/share-your-address">`; both back controls are `<Link href="/#open">`.

**Phases:** `closed → opening → open`, with `opening` skipped entirely under
`prefers-reduced-motion: reduce`.

Because the first client render must match the server's, the stage always renders `closed` first
and upgrades in an effect. The stage wrapper carries an unconditional 300ms CSS fade-in — the same
mount fade the prototype performs in JS — which covers the upgrade, so a visitor arriving at
`/#open` never sees the closed envelope. That fade is pure CSS, so the prerendered HTML is also
correct without JavaScript; only the opening interaction requires it.

### Scaling — container queries, not JavaScript measurement

The design is drawn in a fixed 455 × 779 space and sizes everything as `calc(N * 0.2198cqw)`. The
stage frame sets `container-type: inline-size` (Tailwind's `@container`) and
`aspect-ratio: 455/779`, and `globals.css` defines:

```css
--std-u: 0.2198cqw; /* one design pixel: 1/455 of the stage's inline size */
```

Custom properties resolve at the point of use, so `var(--std-u)` inside the stage always resolves
against the stage container. Every size in the invitation becomes
`calc(N*var(--std-u))`; every position stays a plain percentage.

This is a real improvement on the prototype, which measures `offsetWidth / 455` in JavaScript and
recomputes the whole card choreography from it. The port needs no measurement, no resize listener,
and no layout read.

### Animation — CSS keyframes, no animation library in the app

The opening sequence is a fixed timeline of transforms with no runtime inputs. Once the unit is
`cqw`-based, every keyframe value in the reference doc is a static number, so the entire
choreography expresses directly as CSS `@keyframes`.

- Keyframes live in `src/app/globals.css`.
- Each animation's shorthand is a `--std-anim-*` custom property on `:root`, applied from JSX as a
  single arbitrary property: `[animation:var(--std-anim-flap)]`. They are **not** `@theme inline`
  `--animate-*` entries, for one concrete reason: the flap and each of the three cards need **two**
  simultaneous animations — a transform and a discrete `z-index` step. Tailwind's `animate-*`
  utility writes the whole `animation` shorthand, so two of them on one element would conflict;
  `[animation:var(--std-anim-card-a),var(--std-anim-card-a-z)]` is the only way to run both, and it
  needs the shorthands to be real custom properties.
- Durations bake in the prototype's default `animSpeed` of **1.6**, so a design value of 140ms
  becomes 224ms. Total opening duration: **4624ms**.
- Keeping every shorthand in one `:root` block also makes reduced motion a single override: a
  `@media (prefers-reduced-motion: reduce)` block re-declares each `--std-anim-*` as `none`,
  switching the whole choreography off at once, as a second line of defence behind the state
  machine's own skip. Each element's static classes are its resting state, so with the animations
  gone everything simply appears in place.

No animation library is added to the app. `framer-motion` stays where it already is — inside
`@mocha/ui`, behind `Reveal`, which this app uses for the address page's entrance only.

The one number that must stay in sync between CSS and TypeScript is the total duration. It lives in
`src/components/invitation-timing.ts` as `OPENING_DURATION_MS`, with a comment naming the keyframes
it mirrors, and it is what the state machine's timer uses to flip `opening → open`.

### Color — app-local tokens, and composed decorative properties

Two layers, both in `src/app/globals.css`:

1. **The shared contract.** `--site-*` is overridden in `:root` to the save-the-date palette.
   `packages/ui/src/styles.css` is not edited.

   | Token | Value |
   | --- | --- |
   | `--site-background` | `#FDF7F5` |
   | `--site-surface` | `#FFFFFF` |
   | `--site-foreground` | `#2A2426` |
   | `--site-muted` | `#6F6264` |
   | `--site-border` | `#F3D3DA` |
   | `--site-primary` | `#9E3D53` |
   | `--site-primary-foreground` | `#FFFFFF` |
   | `--site-inverted-background` | `#2A2426` |
   | `--site-inverted-foreground` | `#FFFFFF` |
   | `--site-destructive` | `#B2334F` |

2. **The app-local palette.** `--std-*` custom properties under `:root`, exposed through
   `@theme inline` as `--color-std-*` so they become `bg-std-…` / `text-std-…` / `border-std-…`
   utilities — the save-the-date analogue of Blackberry's `--bb-*`. A comment marks them as
   app-local and outside the shared `@mocha/ui` token contract.

**Composed decorative properties.** The design's ornaments are multi-layer gradients and masks:
the envelope liner's dot pattern, the announcement card's lace ring, the date card's scalloped
mask, the floral bloom's six stacked radials, the petal fill, the gold edge. Written inline they
would be unreadable Tailwind arbitrary values full of escaped spaces, and they would put raw hex in
JSX. Each is therefore defined once as a named `--std-*` custom property in `globals.css` and
referenced from JSX as a single-token arbitrary property:

```tsx
<div className="absolute inset-0 [background:var(--std-liner-pattern)]" />
```

**No raw hex value appears anywhere in `src/`, outside `globals.css`.**

### Type

Five Google faces via `next/font/google` in `layout.tsx`, each with `variable` and
`display: "swap"`, composed onto `<html className={...}>` exactly as Blackberry does. Three fill the
shared contract's slots; two are app-local because the contract has only three.

| Face | Weights | CSS variable | Wired to | Role |
| --- | --- | --- | --- | --- |
| Josefin Sans | 300, 400 | `--font-josefin-sans` | `--site-font-sans` | "Save", "Date", `10.16.2027` |
| Lora | 400, 500 | `--font-lora` | `--site-font-serif` | Body, labels, form, controls |
| Parisienne | 400 | `--font-parisienne` | `--site-font-script` | Couple names, page headings |
| Pinyon Script | 400 | `--font-pinyon-script` | `--std-font-flourish` | "the", the "P&L" monogram |
| Allura | 400 | `--font-allura` | `--std-font-envelope` | "You've been invited" |

The two app-local faces are exposed through `@theme inline` as `--font-std-flourish` and
`--font-std-envelope`, giving `font-std-flourish` and `font-std-envelope`.

`body` sets `font-family: var(--site-font-serif)` — Lora is this design's workhorse body face.
Blackberry uses `--site-font-sans` there; the deviation is deliberate and carries a comment.

### Components

Flat files in `src/components/`, kebab-case, named exports, one section per content file, mirroring
`travel.tsx` / `travel-content.ts` / `travel.test.tsx`.

```
src/app/
  layout.tsx                      fonts + metadata
  globals.css                     tokens, composed properties, keyframes
  page.tsx                        → <InvitationStage />
  share-your-address/page.tsx     → <AddressSection />

src/components/
  invitation-content.ts           every user-visible string on the invitation
  invitation-timing.ts            OPENING_DURATION_MS, mirroring the keyframes
  invitation-stage.tsx      (c)   the phase machine and the stage composition
  envelope.tsx                    back, front, flap, seal, prompt arc
  announcement-card.tsx           "Peyton & Liane are getting married!"
  photo-card.tsx                  the Polaroid
  date-card.tsx                   the scalloped "Save the Date" card
  floral-sprig.tsx                the one sprig, used at four rotations
  petal-scatter.tsx               the seven petals
  ribbon.tsx                      visible only during `opening`
  invitation-note.tsx             the note and the CTA link

  address-content.ts              every user-visible string on the address page
  address-schema.ts               the Zod schema
  address-submit.ts               the submission seam
  address-form.tsx          (c)   the form and its status machine
  address-section.tsx             the address page composition
```

`(c)` marks the only two `"use client"` files. Everything else is a Server Component or a
presentational module rendered inside a client boundary. `InvitationStage` is the client boundary
because the phase machine needs state, an effect, and a click handler; its children are plain
presentational modules with no directive of their own, exactly as the framework intends.

**Why the sub-components are not each a "section trio."** The invitation is one composed stage, not
a stack of sections. `invitation-stage` and `address-section` are the two sections and each gets its
content file. The pieces below them are app-local presentational primitives; they carry no copy of
their own (they import from `invitation-content.ts`) and so need no content file.

**Geometry stays in the components, not in content files.** Tailwind v4 scans source text for class
names, so a constructed class like `` `left-[${x}%]` `` would never be generated. Every position,
size and rotation must therefore be a literal class string in the TSX. The petal scatter holds its
seven placements as an array of literal `className` strings for the same reason. Content files hold
copy only.

### The form

Mirrors `rsvp-form.tsx`: `react-hook-form` + `zod` + `@hookform/resolvers`, with
`Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormDescription`/`FormMessage` plus
`Input`, `Textarea` and `Button` from `@mocha/ui`, restyled with `className` overrides (their `cn`
helper already runs `tailwind-merge`, so overrides win).

Schema, matching the prototype's `validate()` exactly:

| Field | Rule | Message |
| --- | --- | --- |
| `name` | trimmed, min 1 | Please enter your name. |
| `email` | optional; when non-empty, must be a valid address | Please enter a valid email address. |
| `address` | trimmed, min 1 | Please enter your mailing address. |

Status machine: `idle → sending → success | error`. `address-submit.ts` exports `submitAddress`,
which waits the prototype's 1400ms and resolves. It is the **single documented seam** for wiring a
real endpoint — and because the form's error branch is driven by that promise rejecting, the error
state is live, reachable code rather than decoration.

This is the same honesty level as the RSVP form already shipping in Blackberry, which also collects
and discards. It is recorded as a known gap in the app README and in the PR.

### `packages/ui`

**Reuse only; nothing is added.** The app consumes `Reveal`, `Form` and friends, `Input`,
`Textarea` and `Button`. `SiteNav`, `Hero`, `CountdownStrip`, `SiteFooter`, `TabSwitch` and
`SiteShell` do not fit a single-page envelope invitation and are not used. Nothing in this design
needs a new shared primitive: the envelope, the cards, the sprig and the petals are specific to this
one invitation and would be dead weight in Canton and Blackberry.

## Missing assets

Three images the design references live on Canva and are not in the design project. This repo does
not fetch external images, so each gets a CSS placeholder built from app-local tokens, carrying the
repo's established `{/* Placeholder pending real photography. */}` comment — the same pattern
`travel.tsx` already uses.

| Asset | Placeholder |
| --- | --- |
| Floral background | A soft multi-radial wash on the stage background, from `--std-bg-wash-*` |
| Couple photo | A gradient block in the Polaroid's photo well, `aria-hidden` |
| Wax seal | A radial-gradient wax disc under the "P&L" monogram |

The photo's intended `alt` text is preserved in `invitation-content.ts` so it is ready the moment a
real photograph lands; the placeholder itself is `aria-hidden` rather than claiming to be a photo
that is not there.

**Two prototype affordances are deliberately dropped:** the monospace `CSS STAND-IN` tags on the
three cards, and the dashed `glass art` box marking the missing champagne-glass illustration. Both
are design-tool scaffolding; shipping either would look like a rendering bug. Both gaps are recorded
in the app README instead.

## Responsive behavior

The design is mobile-first by construction: a single column capped at 560px, centered. There is no
separate desktop layout to invent — on a wide screen the invitation is a centered card, which is
what a save-the-date should be.

- Stage frame: `width: min(100vw, 560px, max(58.4dvh, 340px))`. The `58.4dvh` term keeps the whole
  invitation inside a desktop viewport's height; the `340px` floor stops it collapsing on a small
  phone.
- At 375 × 812 the frame is 375px wide and 642px tall. At 1440 × 900 it is ~526px wide and ~900px
  tall. Both fit without scrolling.
- `html { min-width: 320px }` and `overflow-x: hidden` on the stage column; the page never scrolls
  horizontally.
- The address page is fluid to a 440px cap, with `clamp()` type, and its footer row wraps.
- Verified in the dev server at ~375px and ~1440px before the PR is opened.

## Accessibility

Ported from the prototype, which already took this seriously.

- One visually-hidden `<h1>` on the invitation carries the entire message:
  *"Peyton & Liane are getting married. Save the date: October 16, 2027, in Trenton, Georgia."*
  It is focused when the opening animation completes.
- The decorative card typography is `aria-hidden`, because the `<h1>` already says it — duplicating
  it would make a screen reader read the announcement twice.
- The envelope is a single `<button>` with
  `aria-label="You've been invited. Open the envelope."`
- The address page's `<h1>` and the form's `<h2>` are real headings; every field has a real
  `<label>`; the address field's help text is a `FormDescription` wired through `aria-describedby`;
  errors are `FormMessage` with `aria-invalid` on the control.
- The submission-error alert is `role="alert"`; the success panel is `role="status"`. The prototype
  moved focus to the success heading instead; a live region is the better React idiom and does not
  steal focus from a user who is still reading.
- Every control is at least 44 × 44px and every focusable element shows a visible
  `outline: 2px solid var(--std-focus-ring)`.
- Decorative glyphs, sprigs, petals, the ribbon and the envelope layers are all `aria-hidden`.
- `prefers-reduced-motion: reduce` skips the opening animation entirely, in both the state machine
  and CSS.

## Testing

Vitest + React Testing Library, colocated, asserting against imported content consts and querying by
role — never against duplicated literals.

| File | Covers |
| --- | --- |
| `invitation-stage.test.tsx` | The hidden `<h1>` text; the closed phase shows the envelope button; clicking it removes the button and renders the cards; reduced motion goes straight to `open` without the ribbon; the CTA's `href` |
| `announcement-card.test.tsx` | Each announcement line renders |
| `date-card.test.tsx` | "Save", "the", "Date", the location and the date render |
| `photo-card.test.tsx` | The placeholder renders and exposes no misleading image role |
| `envelope.test.tsx` | The envelope lettering and the "CLICK TO OPEN" prompt render |
| `invitation-note.test.tsx` | The note copy and the CTA link |
| `address-schema.test.ts` | Every rule in the table above, including that a blank email passes and a malformed one fails |
| `address-form.test.tsx` | Labels and help text; invalid submit surfaces messages and sends nothing; a valid submit shows "Sending…", then the success panel; a rejected `submitAddress` shows the error alert |
| `address-section.test.tsx` | The heading, the closing line and both back links |

Interactive behavior is covered thoroughly; static composition gets light coverage, as the repo's
convention requires. `address-form.test.tsx` uses fake timers for the 1400ms submission delay and
mocks `address-submit` to exercise the rejection branch.

## Repository documentation

- Root `README.md`: "two independently deployed Next.js applications" becomes three; the layout
  tree, the dev-port list (Save the Date on 3002), the `--filter` examples, and the Vercel
  deployment table all gain a Save the Date entry with root directory `apps/save-the-date`.
- Root `AGENTS.md`: the scope list gains `apps/save-the-date`, and the boundaries section gains the
  matching "keep Save the Date-specific copy and composition in `apps/save-the-date`" rule.
- `apps/save-the-date/README.md`: what the app is, how to run it on 3002, and the known gaps — the
  three missing Canva assets, the missing champagne-glass illustration, and the unwired form.
- The scaffold-provenance note in the root README is extended to record that this app was created by
  hand from Blackberry's configs rather than by `create-next-app`.

## Decisions taken, and what was rejected

| Decision | Rejected alternative | Why |
| --- | --- | --- |
| `closed`/`open` share one route | Three real routes, per `HANDOFF.md` | The opening animation needs shared DOM across the two states; a route change destroys it. `/#open` keeps the state addressable, and the page that genuinely is a page does get a real route. |
| Hash `#open` | `?stage=open` | Reading `searchParams` forces `/` to render dynamically. A save-the-date should be a static page. |
| CSS keyframes | Framer Motion in the app | The timeline has no runtime inputs. With `cqw` units every value is static, so CSS expresses it exactly — with no new dependency, no client JS for the animation itself, and `prefers-reduced-motion` handled natively. |
| Composed `--std-*` properties for ornaments | Inline Tailwind arbitrary values | Keeps hex out of JSX, keeps the class lists readable, and gives each ornament one name and one definition. |
| Placeholders for the three Canva images | Fetching them from `mochabearsavethedate.my.canva.site` | The repo does not fetch external images, and the 256 KiB `get_file` cap has already cost one debugging cycle here. |
| Drop the `STAND-IN` tags and the `glass art` box | Port them behind a flag | They are design-tool scaffolding. In production they read as bugs. The gaps belong in the README. |
| `submitAddress` seam with a live error branch | An unreachable `error` state, or omitting it | Matches the design, keeps the error path real code, and leaves exactly one place to wire a backend. |
