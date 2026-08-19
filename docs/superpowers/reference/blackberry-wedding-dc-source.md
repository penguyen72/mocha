# Blackberry Wedding Site — Source Design Reference

**Extracted:** 2026-08-19
**Source:** Claude Design project "Wedding site recreation", `Wedding.dc.html`
**Project ID:** `b65c3d68-cdf2-4e73-bc96-fcbafc18d737`
**URL:** `https://claude.ai/design/p/b65c3d68-cdf2-4e73-bc96-fcbafc18d737?file=Wedding.dc.html`

This is raw source material, not an approved spec. Every implementation session still runs
`superpowers:brainstorming` and produces its own spec/plan under `docs/superpowers/`. This
document exists so that work is faithful to the design without every session having to
re-authenticate against claude.ai or risk the live design project changing mid-effort.

## Getting back to the live project (only if needed)

- MCP tool: `claude_design` (auth via `/design-login`), method `get_file` with the project ID
  above.
- Other files in the project: `assets/hero.jpeg` (the real hero background photo — not a
  placeholder), `uploads/IMG_1653.jpeg`, and `screenshots/01-w.png` … `06-w.png` (rendered
  reference screenshots of the live design — pull these for visual QA/comparison).
- `image-slot.js` and `support.js` are Claude Design's own canvas runtime/tooling (a
  templating + class-component system used only inside the design tool to preview `.dc.html`
  files). They are **not application code** and must not be ported. They only tell you *how the
  design renders inside the design tool*; the actual design intent is captured below.

## Global design tokens

### Palette

| Hex | Suggested token name | Role in the source |
| --- | --- | --- |
| `#FBF6F1` | `cream` / background | Page background, Schedule/Travel/Explore/FAQ section bg, nav bg when scrolled (at 94% opacity), RSVP card bg |
| `#4A3B35` | `ink` | Primary text color, page default text color |
| `#7A675E` | `ink-soft` | Secondary/body copy color |
| `#D6866B` | `terracotta` | Primary accent — countdown strip bg, active tab/button bg, RSVP submit button, timeline dot, FAQ "+" icon |
| `#B2795E` | `clay` | Secondary accent — eyebrow labels, icon-circle text color, RSVP section bg, field labels |
| `#F2C7B4` | `peach` | Details section bg, travel icon-circle bg, Stay-section eyebrow/tag color, a dress-code swatch |
| `#F4E9E0` | `blush` | Wedding Party section bg |
| `#C3A6A8` | `mauve` | Alt schedule day badge color (Fri/Sun), a dress-code swatch |
| `#E7D6C9` | `line` | Borders, timeline line, input borders |
| `#C79B7E` | — | Dress-code swatch only |
| `#000000` | `ink-black` | Stay section bg, Footer bg |
| `#ffffff` | `white` | Cards, nav CTA bg when unscrolled, hero text color |

Hero gradient overlay (over `assets/hero.jpeg`): `linear-gradient(rgba(74,59,53,.55) 0%, rgba(74,59,53,.34) 32%, rgba(74,59,53,.4) 66%, rgba(74,59,53,.68) 100%)` — i.e. `ink` at varying opacity, darkest at top and bottom.

### Typography

- **Cormorant Garamond** (weights 400/500/600) — serif, every heading (`h1`/`h2`/`h3`) and a few
  emphasis lines. Weight 500 is the default heading weight.
- **Jost** (weights 300/400/500) — sans, body text. Page default is weight 300.
- **Pinyon Script** — cursive accent, used sparingly for emotional emphasis: the "&" between
  "Liane" and "Peyton", "together with their families", "will you join us?", "Thank you!".
- Google Fonts import:
  `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@300;400;500&family=Pinyon+Script&display=swap`
- Extensive use of CSS `clamp()` for a fluid type scale (e.g. hero `h1` is
  `clamp(58px,13vw,150px)`). Preserve the fluid proportions rather than snapping to fixed
  breakpoint sizes — this is core to how the design feels at every viewport width.
- Letter-spacing is a deliberate signature throughout: uppercase eyebrows/labels/nav links use
  `letter-spacing: .12em–.28em` plus `text-transform: uppercase`.

### Motion patterns

1. **Scroll reveal** (used on nearly every section heading, card, and paragraph): starts at
   `opacity:0; transform: translateY(30px)`, animates to visible via `IntersectionObserver`
   (`threshold: 0.12`, `rootMargin: "0px 0px -8% 0px"`, fires once), transition
   `1s cubic-bezier(.2,.8,.2,1)`. Grid items (party, hotels, explore cards) additionally stagger
   with `transition-delay: (i % n) * ~80-90ms`. Maps directly to Framer Motion
   `whileInView`/`viewport={{ once: true, amount: 0.12 }}` with a matching custom ease curve
   `[0.2, 0.8, 0.2, 1]`.
2. **Hero entrance**: 5 elements (eyebrow, `h1`, date rule, location line, RSVP button) cascade
   in on mount only (not scroll-triggered), each staggered by `250ms + i*220ms`, animating
   `opacity:0→1, translateY(24px→0)` over `1.1s cubic-bezier(.2,.8,.2,1)`.
3. **Nav**: background/blur/shadow/link-color crossfade once `scrollY > 70% of viewport height`
   — transparent+white-text over the hero, to `rgba(251,246,241,.94)` + blur(12px) + dark text
   once scrolled. Padding also tightens slightly (`22px 48px` → `16px 48px`). Mobile nav is a
   `max-height` animated dropdown (`0` → `400px`, `.3s ease`); the burger icon morphs into an ✕.
4. **Scroll cue**: `floatUp` keyframe on the hero's "Scroll" indicator, `translateY` oscillates
   0↔-10px, `3s ease-in-out infinite`; hidden entirely once the page has scrolled.
5. **Countdown**: recomputes every second client-side, target is the ceremony start —
   `2027-10-02T16:00:00-04:00` (Saturday, 4:00 PM ET). Displays days (unpadded) / hours / minutes
   / seconds (all zero-padded to 2 digits).
6. **FAQ accordion**: answer wrapper animates `max-height: 0 → 400px` (`overflow:hidden`), the
   "+" icon rotates `45deg` when open. One open item at a time (accordion, not multi-expand).
7. **Tab groups** (Stay: On-Estate/Downtown; Explore: Chattanooga/Atlanta) and **button-groups**
   (RSVP attend yes/no, meal preference, lodging preference): instant background/border/text-color
   swap on selection — no motion beyond a quick color transition. Switching a tab also re-triggers
   the scroll-reveal stagger on the newly shown grid.

## Page structure, copy, and data (top to bottom)

### 1. Nav (fixed)

Brand: `L & P` (ampersand in Pinyon Script). Links: **Schedule, Travel, Stay, Explore, Details,
FAQ**, then a pill-button **RSVP** CTA. Burger menu appears under 860px viewport width.

### 2. Hero — `#home`

- Background: `assets/hero.jpeg` (real engagement photo), full-bleed, `cover`, with the ink
  gradient overlay above.
- Eyebrow (Pinyon Script): "together with their families"
- H1 (Cormorant Garamond): "Liane **&** Peyton" (ampersand on its own line, Pinyon Script)
- Date rule: "Oct 1–3, 2027" between two horizontal rules
- Location line: "The Villa at Blackberry Ridge · Trenton, Georgia"
- CTA button → `#rsvp`: "RSVP Now"
- Scroll cue: "Scroll" + vertical line, floats, hides after scrolling

### 3. Countdown strip

Bg `terracotta`. Italic serif line: "We can't wait to celebrate with you". Four stats: **Days /
Hours / Minutes / Seconds** counting down to 2027-10-02 16:00 -04:00.

### 4. Schedule of Events — `#schedule`

Eyebrow "The Weekend", H2 "Schedule of Events", intro: "Three days in the North Georgia
foothills. Here's the rhythm of the weekend — come to what you can, and don't stress the
details. Final times will be confirmed closer to the date."

Vertical center-line timeline, cards alternate left/right of a dot marker, grouped by day badge:

| Day badge | Time | Title | Description | Side |
| --- | --- | --- | --- | --- |
| Friday · October 1 | 6:00 PM | Welcome Party | "Kick things off with drinks, bites & live music on the Villa patio under the bistro lights. Casual — come as you are." | left |
| Saturday · October 2 · The Big Day | 4:00 PM | Ceremony | "We say \"I do\" in the garden by the fountain. Please arrive by 3:30 to find your seat." | right |
| Saturday · October 2 · The Big Day | 5:00 PM | Cocktail Hour | "Signature cocktails & hors d'oeuvres on the patio while we sneak away for photos." | left |
| Saturday · October 2 · The Big Day | 6:30 PM | Reception | "Dinner, toasts, cake & dancing in the Grand Hall until we send the night off at 11:00." | right |
| Sunday · October 3 | 10:00 AM | Farewell Brunch | "One more cup of coffee together before you head home. Drop by the Villa any time before noon." | left |

Friday/Sunday badges use `mauve`; Saturday badge uses `terracotta`.

### 5. Wedding Party — `#party`

Eyebrow "By Our Side", H2 "The Wedding Party", intro: "The people who've had our backs long
before this weekend — and who'll be standing with us when it counts." Grid: 4 columns desktop, 2
mobile. Each card: photo (3:4), name, role (uppercase, `clay`), "For Liane"/"For Peyton" in
italic serif.

| Name | Role | For |
| --- | --- | --- |
| Maya Chen | Maid of Honor | Liane |
| Priya Anand | Bridesmaid | Liane |
| Sofia Reyes | Bridesmaid | Liane |
| Grace Okoro | Bridesmaid | Liane |
| Daniel Cole | Best Man | Peyton |
| Marcus Webb | Groomsman | Peyton |
| Eli Nakamura | Groomsman | Peyton |
| Theo Brandt | Groomsman | Peyton |

### 6. Travel & Directions — `#travel`

Eyebrow "Getting Here", H2 "Travel & Directions", body: "The Villa at Blackberry Ridge sits in
the foothills of Trenton, Georgia — tucked between Chattanooga and Atlanta. It's an easy drive
from either, and the countryside on the way is half the fun."

| Icon | Title | Description |
| --- | --- | --- |
| ✈ | By air | "Chattanooga (CHA) is 45 min away; Atlanta (ATL) is ~2 hrs and has more direct flights. Rental car recommended either way." |
| ⌁ | By car | "Just off Hwy 301 in Trenton, GA. Free on-site parking — carpooling encouraged for the welcome party." |
| ✦ | Shuttle | "A shuttle will run between the downtown Chattanooga hotel block and the Villa on Saturday. Details to come." |

Right column: venue/grounds photo with an overlapping address card: "625 Hwy 301 S" /
"Trenton, GA 30752".

### 7. Accommodations (Stay) — `#stay`

Bg `ink-black` (`#000`), text white. Eyebrow "Where to Stay" (`peach`), H2 "Accommodations",
body: "Make a weekend of it. Stay right on the estate, or settle into downtown Chattanooga
(about 30 minutes north). Mention the Liane & Peyton wedding block when you book." Tab switch:
**On the Estate** / **Downtown Chattanooga**. 4-card grid per tab (4 cols desktop, 1 mobile).

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

### 8. Explore — `#explore`

Eyebrow "Make a Trip of It", H2 "Things to Do", body: "Two great cities bookend the venue. A few
of our favorite ways to spend the extra hours, whether you fly into Chattanooga or Atlanta." Tab
switch: **Chattanooga · 30 min** / **Atlanta · 2 hrs**. 6-card grid per tab (3 cols desktop, 1
mobile), each with a 16:10 photo.

**Chattanooga:**

| Name | Description |
| --- | --- |
| Lookout Mountain | "Ruby Falls, Rock City & the Incline Railway — see seven states from the overlook." |
| Tennessee Aquarium | "One of the best in the country, right on the revitalized downtown riverfront." |
| Walnut Street Bridge | "Stroll the historic pedestrian bridge and the Riverwalk at golden hour." |
| Bluff View Art District | "Cobblestone streets, gardens, galleries and café pastries above the river." |
| Downtown Dining | "From St. John's to Main Street Meats — Chattanooga's food scene punches up." |
| Coolidge Park | "Antique carousel, riverfront lawns and easy afternoons on the North Shore." |

**Atlanta:**

| Name | Description |
| --- | --- |
| Georgia Aquarium | "The largest in the Western Hemisphere — whale sharks and all." |
| Ponce City Market | "Food hall, rooftop games and shops in a landmark Beltline building." |
| The Atlanta BeltLine | "Walk or bike the Eastside Trail past murals, breweries and parks." |
| Piedmont Park | "Atlanta's green heart, with skyline views and the Botanical Garden next door." |
| World of Coca-Cola | "A only-in-Atlanta classic beside the Civil Rights Center downtown." |
| Historic Sweet Auburn | "The MLK Jr. National Historical Park and the soul of the city." |

### 9. Details — `#details`

Bg `peach`. Two cards side by side (stack on mobile):

**Dress Code card:** eyebrow "What to Wear", H2 "Dress Code", "Garden Formal" (emphasized line),
body: "Think dusty rose, terracotta, sage & warm neutrals to match the fall gardens. Suits and
cocktail dresses, florals encouraged." Five color swatches (`#F7DDD0, #F2C7B4, #C3A6A8, #C79B7E,
#B2795E`). Footnote (italic serif): "A note on shoes: the ceremony is on grass & garden paths —
block heels or flats will thank you."

**Registry card:** eyebrow "Gifts", H2 "Registry", body: "Your presence is the gift — truly. But
if you'd like to help us feather the nest (and fund the honeymoon), we've put together a few
things below." Links (each row → `#rsvp` in the source, i.e. currently unwired
placeholder hrefs — real registry links are a content TODO): **Crate & Barrel**, **Zola
Registry**, **Honeymoon Fund**.

### 10. FAQ — `#faq`

Eyebrow "Good to Know", H2 "Questions?". 6-item single-open accordion:

| Question | Answer |
| --- | --- |
| Can I bring a plus-one? | "We've reserved seats for the guests named on your invitation. If your RSVP form lets you add a guest, you're all set — otherwise reach out to us directly." |
| Are kids welcome? | "We love your little ones! This is a family-friendly weekend. Let us know how many children to expect on your RSVP so we can plan." |
| What's the weather like in early October? | "North Georgia falls are gorgeous — sunny days around 70°F and cool evenings in the 50s. Bring a layer for the outdoor ceremony and reception patio." |
| Is the ceremony indoors or outdoors? | "The ceremony is outdoors in the garden (with a covered backup for weather). Cocktails are on the patio; dinner and dancing move into the Grand Hall." |
| Will there be a shuttle? | "Yes — a shuttle will run between the downtown Chattanooga hotel block and the Villa on Saturday. Times will be shared as we get closer." |
| When should I RSVP by? | "Please respond by August 1, 2027 so we can give the venue a final headcount. The sooner the better!" |

### 11. RSVP — `#rsvp`

Bg `clay`. Eyebrow (Pinyon Script) "will you join us?", H2 "RSVP", body: "Kindly respond by
**August 1, 2027**. One form per household — add each guest below."

Form fields, in order:

1. **Full name(s)** — text, placeholder "Jordan & Alex Rivera"
2. **Email** — email, placeholder "you@email.com"
3. **Will you be attending?** — two-button toggle: "Joyfully accepts" / "Regretfully declines"
4. *If attending "yes"*, reveal:
   - **Number of guests** — select, 1/2/3/4/"5+"
   - **Which events will you join?** — checkboxes: Friday Welcome Party, Saturday Ceremony &
     Reception, Sunday Farewell Brunch
   - **Meal preference** — 4-button group: Herb-Roasted Chicken, Braised Short Rib, Pan-Seared
     Salmon, Wild Mushroom Risotto (V)
   - **Dietary restrictions or allergies** — text, placeholder "Nut allergy, gluten-free, none…"
   - **Lodging preference** — 3-button group: "Staying on the estate" (value: "On the estate
     (Yorkshire Manor & cottages)"), "Booking a Chattanooga hotel" (value: "Downtown Chattanooga
     hotel"), "I'll make my own arrangements" (value: "Making my own arrangements")
   - **Song request** — text, placeholder "Artist – Song"
5. **A note for the couple (optional)** — textarea, placeholder "Can't wait to celebrate with
   you both!"
6. Submit button: "Send RSVP"

On submit (source has no real persistence — it's client-only local state): show a thank-you
panel — "Thank you!" (Pinyon Script, `terracotta`), "We've got your RSVP.", message varies by
attend value ("We'll miss you — thank you for letting us know." vs "We can't wait to celebrate
with you!"), and an "Edit response" button that resets back to the form.

**Note for implementation:** the source has no backend — submission is purely local UI state.
Session 5 (RSVP) should treat real persistence (where responses actually go) as an open question
to raise in its brainstorm rather than an assumption baked in here.

### 12. Footer

Bg `ink-black`. "Liane & Peyton" (serif, ampersand Pinyon Script), "October 1–3, 2027 · Trenton,
Georgia", "Made with love for our favorite people."

## Explicit non-goals of this reference

This document captures *design intent* only. It intentionally does not prescribe: component
boundaries, file structure, the shadcn/ui customization approach, the Zod schema shape, the
Tailwind token/theme wiring, or the animation implementation API. Those are architectural
decisions each session's `superpowers:brainstorming` + spec must make and record.
