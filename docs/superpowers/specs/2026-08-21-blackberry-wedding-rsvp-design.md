# Blackberry Wedding RSVP Design

**Date:** 2026-08-21
**Status:** Approved in conversation; awaiting written-spec review
**Session:** 5 of 5 in the Blackberry wedding-site port (see
`docs/superpowers/reference/blackberry-wedding-dc-source.md` for the full source design this
port is targeting). Depends on Session 1 (foundation — merged to `main`): design tokens,
Tailwind wiring, `packages/ui`'s `Reveal`/`SiteNav`/`Hero`/`CountdownStrip`/`SiteFooter`, and a
restyled shadcn `Button`.

## Purpose

Build the RSVP form (`#rsvp`) — the last of the five wedding-site content sections, and the most
engineering-heavy: a multi-field form with a conditionally-branching validation schema (fields
required only when the guest is attending), a client-side submitted/thank-you view, and no
backend.

Out of scope: every other page section (Schedule, Wedding Party, Travel, Stay, Explore, Details,
FAQ — Sessions 2–4, none of which have merged yet either; `page.tsx` still has Sessions 2–5's
placeholder comment directly between `CountdownStrip` and `SiteFooter`).

## Persistence — explicit decision

The source design (`Wedding.dc.html`) has no backend: submitting the form is purely local UI
state that swaps to a "Thank you!" panel. `AGENTS.md` forbids adding storage, authentication, or
a form service without an approved design, and this repo's boilerplate spec explicitly excluded
RSVP persistence from scope.

**Decision:** this session matches the source exactly — client-only state, no network call, no
data leaves the browser. Real persistence (where a response should actually go — email, a form
service, a database) is explicitly deferred to a future spec. This is a conscious scope
boundary, not an oversight: do not add a submission endpoint, environment variable, or storage
dependency as part of this work.

## Architecture

Two-layer split between the shared UI package and the app:

- **`packages/ui`** gains generic, content-agnostic shadcn primitives — no RSVP copy, no field
  list, no Zod schema. These are pure visual/interaction building blocks, the same way `Button`
  was added in Session 1.
- **`apps/blackberry`** owns the actual RSVP form: its exact field list, copy, option values, and
  the Zod schema with its conditional-required rules.

This deviates from Session 1's stated blanket convention ("every section, by convention, is a
prop-driven, content-agnostic structural component in `packages/ui`"). The deviation is
deliberate and was confirmed in brainstorming: that convention fits structural/visual components
where "content" is just strings and arrays (`Hero`, `SiteFooter`, a future `Schedule`/`Party`
grid). The RSVP form's "content" is business logic — a conditional-required validation schema
and an exact field/option list — not reusable UI. Forcing it into a fully generic,
props-configured shape would mean passing an entire Zod schema shape and callback-heavy field
config through props, with no second consumer (Canton has no approved design) to justify the
abstraction cost. `packages/ui` still gets everything that *is* genuinely reusable: the shadcn
primitives themselves.

### New in `packages/ui`

All in `packages/ui/src/components/ui/`, added via `pnpm dlx shadcn@latest add <component>` and
hand-converted from `@/`-prefixed imports to relative imports (per `AGENTS.md`'s existing
convention), then hand-restyled to the `--site-*` token convention the way `Button` was —
stripping shadcn's default `dark:` variants (this repo has no dark mode) and its
`input`/`ring`/`accent`/`secondary` token references in favor of the tokens already wired
(`border-border`, `bg-background`/`bg-surface`, `ring-primary`) plus the one new token this
session adds (below):

- `form.tsx` — `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`,
  `FormMessage`: the standard shadcn wrapper around react-hook-form's `FormProvider`/`Controller`
  plus Radix `Label`. No RSVP-specific logic — purely the react-hook-form/Radix wiring.
- `label.tsx`, `input.tsx`, `textarea.tsx` — straightforward restyled shadcn primitives.
- `select.tsx` — Radix `Select`, for the guest-count field.
- `checkbox.tsx` — Radix `Checkbox`, for the events multi-select.
- `radio-group.tsx` — Radix `RadioGroup`/`RadioGroupItem`, restyled with **one** selected/
  unselected treatment: unselected is an outline pill (`border-border`, transparent/surface bg,
  foreground text), selected is a filled pill (`bg-primary text-primary-foreground`) — an
  instant color swap, no motion, matching the source's "button-groups... instant background/
  border/text-color swap on selection." This single restyled primitive is reused for all three
  button-group fields (attend toggle, meal preference, lodging preference), the same way
  `Button`'s one `default` variant covers every button in the source.

New dependencies in `packages/ui/package.json`:
- `react-hook-form` — **peerDependency** (alongside `next`/`react`/`react-dom`), not a plain
  dependency, because both `packages/ui`'s `Form` wrapper *and* Blackberry's `RsvpForm` call into
  it directly (`useFormContext`, `useForm`) — unlike `framer-motion`, which is a pure
  implementation detail `Reveal` hides from consumers.
- `@radix-ui/react-label`, `@radix-ui/react-select`, `@radix-ui/react-checkbox`,
  `@radix-ui/react-radio-group` — plain dependencies, same pattern as the existing
  `@radix-ui/react-slot`.

### New shared token: `--site-destructive`

None of Session 1's tokens read as an error/danger color (the palette is entirely warm
neutrals/terracotta/clay). Zod validation errors need one. Added following Session 1's exact
token-slot pattern:

`packages/ui/src/styles.css` (new shared slot, neutral default):
```css
--site-destructive: #b91c1c;
```
```css
/* in @theme inline */
--color-destructive: var(--site-destructive);
```

`apps/blackberry/src/app/globals.css` (real value):
```css
--site-destructive: #b3261e;
```

No `--site-destructive-foreground` — this session only needs destructive *text* (`FormMessage`),
not a filled destructive surface (no destructive `Button` variant is being added; Session 1
already deferred that pairing until a session needs it, and this session doesn't).

The reference doc doesn't specify literal error-color CSS or input border-radius from the
source — those weren't captured in the extraction. This session makes reasonable, documented
calls (a standard accessible red for errors; `rounded-md` bordered inputs consistent with the
soft editorial aesthetic) rather than guessing at unavailable pixel values.

### New in `apps/blackberry`

All in `apps/blackberry/src/components/`:

- **`rsvp-schema.ts`** — the option constants and Zod schema (see Data model below). Single
  source of truth: the same option arrays drive both validation and the rendered
  checkboxes/select/radio-groups.
- **`rsvp-schema.test.ts`** — unit tests directly against the schema via `safeParse`, independent
  of rendering.
- **`rsvp-form.tsx`** (`"use client"`) — owns `useForm` (zodResolver), the conditional field
  block, the submitted/thank-you toggle, "Edit response."
- **`rsvp-form.test.tsx`** — RTL interaction tests.
- **`rsvp-section.tsx`** (Server Component, no `"use client"`) — `<section id="rsvp">`, static
  eyebrow/H2/intro copy wrapped in `Reveal` (imported from `@mocha/ui`), composes `<RsvpForm />`.
  Matches the `Hero` precedent: the section itself needs no client boundary; only its interactive
  child does.
- **`rsvp-section.test.tsx`** — render test confirming static copy and composition.

New dependencies in `apps/blackberry/package.json`: `react-hook-form`, `zod`,
`@hookform/resolvers`.

`page.tsx`: import `RsvpSection` from `./components/rsvp-section` (app-local — not exported from
`@mocha/ui`, per the component-split decision above) and render it between `CountdownStrip` and
`SiteFooter`. Update the existing placeholder comment to reflect that Schedule/Party/Travel/
Stay/Explore/Details/FAQ (Sessions 2–4) are still pending and RSVP (Session 5) is now composed.

## Data model (`rsvp-schema.ts`)

```ts
export const EVENT_OPTIONS = [
  "Friday Welcome Party",
  "Saturday Ceremony & Reception",
  "Sunday Farewell Brunch",
] as const;

export const MEAL_OPTIONS = [
  "Herb-Roasted Chicken",
  "Braised Short Rib",
  "Pan-Seared Salmon",
  "Wild Mushroom Risotto (V)",
] as const;

export const GUEST_COUNT_OPTIONS = ["1", "2", "3", "4", "5+"] as const;

export const LODGING_OPTIONS = [
  { label: "Staying on the estate", value: "On the estate (Yorkshire Manor & cottages)" },
  { label: "Booking a Chattanooga hotel", value: "Downtown Chattanooga hotel" },
  { label: "I'll make my own arrangements", value: "Making my own arrangements" },
] as const;

const rsvpBaseSchema = z.object({
  fullName: z.string().trim().min(1, "Please enter your name."),
  email: z.string().trim().min(1, "Please enter your email.").email("Enter a valid email address."),
  attending: z.enum(["yes", "no"], { required_error: "Please let us know if you can make it." }),
  guestCount: z.enum(GUEST_COUNT_OPTIONS).optional(),
  events: z.array(z.enum(EVENT_OPTIONS)).optional(),
  mealPreference: z.enum(MEAL_OPTIONS).optional(),
  dietaryRestrictions: z.string().trim().optional(),
  lodgingPreference: z.enum(LODGING_VALUES).optional(), // LODGING_VALUES = tuple of LODGING_OPTIONS[].value
  songRequest: z.string().trim().optional(),
  message: z.string().trim().optional(),
});

export const rsvpFormSchema = rsvpBaseSchema.superRefine((data, ctx) => {
  if (data.attending !== "yes") return;
  if (!data.guestCount) {
    ctx.addIssue({ path: ["guestCount"], code: z.ZodIssueCode.custom, message: "Please select a guest count." });
  }
  if (!data.events || data.events.length === 0) {
    ctx.addIssue({ path: ["events"], code: z.ZodIssueCode.custom, message: "Please select at least one event." });
  }
  if (!data.mealPreference) {
    ctx.addIssue({ path: ["mealPreference"], code: z.ZodIssueCode.custom, message: "Please select a meal preference." });
  }
  if (!data.lodgingPreference) {
    ctx.addIssue({ path: ["lodgingPreference"], code: z.ZodIssueCode.custom, message: "Please select a lodging preference." });
  }
});

export type RsvpFormValues = z.infer<typeof rsvpBaseSchema>;
```

**Required-field policy (confirmed in brainstorming):** structured/forced-choice fields
(`guestCount`, `events` [≥1], `mealPreference`, `lodgingPreference`) become required only when
`attending === "yes"`; free-text fields (`dietaryRestrictions`, `songRequest`, `message`) stay
optional always, since "nothing to report" is a legitimate answer for them. `fullName`/`email`
are required regardless of `attending`.

`superRefine` over a flat object (not `z.discriminatedUnion`) keeps every field registered in one
`useForm` call and matches the "reveal, don't remount" UX — the "no" branch doesn't need a
differently-shaped object.

Event values and meal-preference values use their exact label text (the source gives no distinct
value for these, unlike lodging preference, which explicitly specifies label ≠ value).

## Field list → component mapping

| # | Field | Component | Always required | Required when attending |
| - | --- | --- | --- | --- |
| 1 | Full name(s) | `Input`, placeholder "Jordan & Alex Rivera" | ✅ | — |
| 2 | Email | `Input type="email"`, placeholder "you@email.com" | ✅ | — |
| 3 | Attending | `RadioGroup` (button-group), "Joyfully accepts" / "Regretfully declines" | ✅ | — |
| 4 | Guest count | `Select`, 1/2/3/4/5+ | — | ✅ |
| 5 | Events | 3× `Checkbox` | — | ✅ (≥1) |
| 6 | Meal preference | `RadioGroup` (button-group), 4 options | — | ✅ |
| 7 | Dietary restrictions | `Input`, placeholder "Nut allergy, gluten-free, none…" | — | optional |
| 8 | Lodging preference | `RadioGroup` (button-group), 3 options, label ≠ value | — | ✅ |
| 9 | Song request | `Input`, placeholder "Artist – Song" | — | optional |
| 10 | Message | `Textarea`, placeholder "Can't wait to celebrate with you both!" | — | optional (always shown) |

Fields 4–9 render only when `attending === "yes"`; field 10 always renders alongside the submit
button.

## Visual states

- **Button-groups** (attend toggle, meal preference, lodging preference): unselected = outline
  pill; selected = filled `bg-primary text-primary-foreground`. Instant swap, no transition beyond
  color, per the source's motion-pattern catalog.
- **Events checkboxes**: standard shadcn `Checkbox` styling — the source calls these "checkboxes,"
  distinct from the button-group pattern.
- **Conditional reveal**: the source's motion-pattern catalog does not list an animation for this
  reveal (only scroll-reveal, hero entrance, nav crossfade, scroll cue, countdown, FAQ accordion,
  and the button/tab groups are documented). Implemented as a plain conditional render — no
  Framer Motion.
- **Validation errors**: inline per-field via `FormMessage`, in the new `--color-destructive` red.
- **Thank-you panel**: replaces the form entirely (not an overlay). "Thank you!" in
  `font-script text-primary` (Pinyon Script, terracotta — matches the source), "We've got your
  RSVP.", then a message that varies by the submitted `attending` value: "We can't wait to
  celebrate with you!" (yes) / "We'll miss you — thank you for letting us know." (no). "Edit
  response" button (`Button variant="outline"`) returns to the form.

## Submit flow & "Edit response"

`rsvp-form.tsx` holds `submitted: "yes" | "no" | null` local state (`useState`). On a valid
submit (`handleSubmit`), set `submitted` to the submitted `attending` value; render the
thank-you panel whenever `submitted !== null`. "Edit response" sets `submitted` back to `null` —
**form values are not cleared** (no `form.reset()` call), so the guest's prior answers are still
there to edit. This is a documented inference: the source says "Edit response... resets back to
the form," read here as resetting the *view* rather than wiping entered data, since clearing a
guest's answers on "edit" would be poor UX for a form whose entire purpose is capturing their
answers. If this reading is wrong, it's a one-line change (add `form.reset(values)` on submit,
skip it on edit) — flagging so it's an explicit, easily-revisited call rather than a silent one.

## Error handling & edge cases

- No network/pending/retry states — there is no network call (see Persistence above).
- `fullName`/`email` use `.trim().min(1)` so whitespace-only input fails validation.
- When `attending` flips from "yes" back to "no," the conditional fields unmount but react-hook-
  form keeps their last-entered values in memory (no `shouldUnregister`) rather than force-
  clearing them. Harmless: nothing persists this data, and the schema only validates those fields
  when `attending === "yes"`. A deliberate simplicity call, not an oversight.
- `prefers-reduced-motion` is already handled inside the shared `Reveal` component (Session 1);
  nothing new needed here since this session's only `Reveal` usage is the static section
  eyebrow/heading/intro.

## Testing

Vitest + Testing Library, behavior over snapshots, following the existing test patterns in
`packages/ui` and this app.

**`rsvp-schema.test.ts`** (schema-level, via `safeParse` — no rendering):
- `attending: "no"` succeeds without guest count/events/meal/lodging.
- `attending: "yes"` missing meal preference fails, with the issue path `["mealPreference"]`.
- `attending: "yes"` missing guest count, missing events, and missing lodging preference each
  fail independently.
- `attending: "yes"` with every required field present succeeds.
- Malformed email fails; blank/whitespace-only `fullName` fails.
- `dietaryRestrictions`/`songRequest`/`message` all succeed when omitted, even when attending is
  "yes."

**`rsvp-form.test.tsx`** (component/interaction):
- Toggling "attending" to "yes" reveals the conditional field block; toggling to "no" hides it.
- Submitting "attending: yes" without a meal selection shows a validation error and does **not**
  show the thank-you panel.
- Valid "attending: yes" submission shows the "We can't wait to celebrate with you!" message.
- Valid "attending: no" submission shows the "We'll miss you — thank you for letting us know."
  message, without requiring any conditional field.
- "Edit response" returns to the form with previously entered values still populated.

**`rsvp-section.test.tsx`** (render):
- Static eyebrow/heading/intro copy renders; the form is composed inside the section.

## Non-goals

- Real persistence of any kind (backend endpoint, email delivery, form service, database) —
  explicitly deferred to a future spec, per the Persistence decision above.
- Every other page section (Schedule, Party, Travel, Stay, Explore, Details, FAQ — Sessions 2–4).
- Dark mode (not part of this design system at all).
- Pixel-exact matching of source CSS values not captured in the reference doc (error color,
  input border-radius) — reasonable, documented calls are made instead.
- A generic/prop-driven `RsvpForm` in `packages/ui` — explicitly rejected in favor of the
  component-split decision above.

## Acceptance criteria

1. `packages/ui` gains `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage`,
   `Label`, `Input`, `Textarea`, `Select`, `Checkbox`, and `RadioGroup`/`RadioGroupItem`, all
   hand-restyled to the `--site-*` token convention, none containing Blackberry-specific copy.
2. `packages/ui/src/styles.css` gains the `--site-destructive`/`--color-destructive` token slot
   with a neutral default; Canton's existing `SiteShell` test still passes unmodified.
3. `apps/blackberry/src/app/globals.css` overrides `--site-destructive` with a real value.
4. `rsvp-schema.ts` defines the field list, option constants, and the conditional-required Zod
   schema exactly as specified in the Data model section.
5. `rsvp-form.tsx` renders every field from the Field list table, reveals fields 4–9 only when
   attending is "yes," validates via the schema, and shows the correct attend-conditional
   thank-you message with a working "Edit response."
6. `rsvp-section.tsx` composes the static copy and `RsvpForm`, wrapped in `Reveal`, as a Server
   Component.
7. `apps/blackberry/src/app/page.tsx` composes `RsvpSection` directly before `SiteFooter`.
8. All tests in the Testing section pass, including every conditional-required Zod rule.
9. `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` all pass from the repository root.

## References

- `docs/superpowers/reference/blackberry-wedding-dc-source.md` — full extracted source design,
  section 11 (RSVP)
- `docs/superpowers/specs/2026-08-19-blackberry-wedding-foundation-design.md` — Session 1's
  foundation spec (tokens, shadcn setup, component conventions)
- `docs/superpowers/specs/2026-08-18-turborepo-wedding-sites-design.md` — original boilerplate
  spec (RSVP explicitly excluded from that scope)
