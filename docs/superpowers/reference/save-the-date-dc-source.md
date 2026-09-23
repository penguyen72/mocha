# Save the Date — Source Design Reference

**Extracted:** 2026-09-23
**Source:** Claude Design project, `Save the Date.dc.html` (a sibling `Save the Date v1.dc.html`
exists in the project and is the superseded first pass — it was **not** extracted and is not the
port target)
**Project ID:** `06edabbf-e66b-4c45-9e1d-da59d4b35c87`
**URL:** `https://claude.ai/design/p/06edabbf-e66b-4c45-9e1d-da59d4b35c87?file=Save+the+Date.dc.html`
**Fetched with:** `DesignSync` (the `claude_design` MCP; auth via `/design-login`), method
`get_file`. Both `Save the Date.dc.html` and `HANDOFF.md` came back with `truncated: false`.

This is raw source material, not an approved spec. Every implementation session still runs
`superpowers:brainstorming` and produces its own spec/plan under `docs/superpowers/`. This
document exists so that work is faithful to the design without every session having to
re-authenticate against claude.ai or risk the live design project changing mid-effort.

## Getting back to the live project (only if needed)

- MCP tool: `DesignSync` / `claude_design` (auth via `/design-login`), method `get_file` with the
  project ID above.
- Other files in the project:
  - `HANDOFF.md` — the prototype author's own handoff notes. Reproduced verbatim below.
  - `Save the Date v1.dc.html` — superseded earlier version. Ignore.
  - `shots/01-anim.jpg` … `shots/05-flip.jpg` (23 files) — rendered reference screenshots of the
    live design across the animation states (`anim`, `check`, `env2`, `flap`, `flip`, `probe`).
    Pull these for visual QA/comparison.
  - `uploads/screens-1790143203994-5iwe.png`, `-8isj.png`, `-1ing.png` — the original Canva
    reference screenshots the design was recreated from.
  - `support.js` — Claude Design's own canvas runtime (a templating + class-component system used
    only inside the design tool to preview `.dc.html` files). **Not application code.** It only
    explains *how the design renders inside the design tool*; the design intent is captured below.
- **Binary-asset gotcha (hit once already in this repo, cost a full debugging cycle):** `get_file`
  silently caps at 256 KiB. A truncated JPEG still returns complete, syntactically-fine JSON with a
  valid base64 `content` field, still passes a `file`/dimension check, and still renders — as ~95%
  flat grey. If any future session fetches a binary asset via this tool, verify the decoded file
  has a real JPEG end-of-image marker (last two bytes `FF D9` — `xxd -s -2 <file>`) and render a
  visual preview before trusting it; do not rely on `file(1)` or reported dimensions alone. For
  anything likely to exceed 256 KiB, ask the human to export it from the design project directly.
  **No binary asset was fetched during this extraction** — see "Missing assets" below.

## `HANDOFF.md` — verbatim from the design project

> # Save the Date: prototype handoff
>
> File: `Save the Date.dc.html`. Routes use hashes in the prototype: `#/`, `#/envelope-open`,
> `#/share-your-address`. Production should map these to real paths.
>
> ## Assets
> - Linked from Canva, not downloaded: the floral background, closed envelope, open envelope, wax
>   seal and couple photo. **Gap:** these need to be downloaded into the project before launch.
>   Canva blocked downloading them from here.
> - Not used: the Canva photo-frame layer (586×800). Its proportions don't match the Polaroid in
>   the reference, so the frame is recreated in CSS.
> - **CSS stand-ins:** the lace-bordered announcement card, the scalloped date card and the
>   Polaroid frame. They carry small "STAND-IN" tags; turn off `markStandIns` to hide them.
> - **Missing:** the champagne-glass illustration. It is a dashed placeholder until you send a
>   Canva export.
> - Envelope layers: the flap and pocket are masked from the flat Canva envelope images. There is
>   no layered source art.
>
> ## Fonts (substitutes, not verified against Canva)
> - Couple names, announcement, address heading and closing message: Parisienne
> - "Save", "Date" and the numeric date: Josefin Sans Light
> - "the": Pinyon Script
> - Location, note and Back control: Lora
> - Envelope lettering: Allura. The dashed underline on the Canva lettering is not reproduced.
>
> ## UX changes from the reference
> - Typo fixed: "are getting married!"
> - The address form's button now says "Send address" instead of "RSVP".
> - The address field is multiline, with help text. Email is marked optional.
> - Inline validation errors, and Sending, Error and Success states.
> - The envelope is one accessible button. Controls are at least 44px, focus rings are visible, and
>   reduced motion is respected.
> - The envelope is vertically centered, so it's visible on arrival.
> - Small supporting text is slightly enlarged.
>
> ## Form submission: SIMULATED
> Nothing is saved or sent. Submitting waits 1.4 seconds, then shows success (or error, if
> `simulateOutcome` is set to error). **Remaining dependency:** connect the form to a submission
> endpoint or form provider you control, and confirm storage with a test submission.
>
> ## Preview props
> `formPreview` forces the address page into the idle, invalid, sending, success or error state,
> using sample data.

## Missing assets

Five images are referenced by absolute URL against `https://mochabearsavethedate.my.canva.site/_assets/media/`.
None are in the design project; none were fetched (this repo does not fetch external images).

| Asset | Canva filename | Used where | Status |
| --- | --- | --- | --- |
| Floral background | `bad2c19288d18845ca69c05075a755c6.png` | `main` background, `center/cover` | Not available |
| Couple photo | `1162478877cca35e31c841767195395d.jpg` | Polaroid card | Not available |
| Wax seal | `7ce1b1e7c61a0192620dacaed4351f19.png` | Seal under the "P&L" monogram | Not available |
| Closed envelope | `98838e3889a3bd49c0278a93d9663eb1.png` | Preloaded but **never rendered** — the envelope is entirely CSS | Not needed |
| Open envelope | `bcd77b4662bb6e94ddc049f905f37767.png` | Preloaded but **never rendered** | Not needed |

Also missing, by the author's own note: the champagne-glass illustration on the date card. The
prototype draws a dashed box containing the text "glass art" in its place.

## Global design tokens

### Palette

Every literal color in the source, by role.

#### Shell

| Hex | Role in the source |
| --- | --- |
| `#FDF7F5` | `html`/`body` background, and the outer flex wrapper |
| `#FCF5F2` | `main` background (sits under the floral image) |
| `#9E3D53` | Link color; every focus-ring outline |
| `#7A2A3E` | Link hover |

#### Envelope — cream and gold

| Hex | Role |
| --- | --- |
| `#E3D1AC` → `#ECDEC1` (55%) → `#F0E4CA` | Envelope back, `linear-gradient(180deg, …)` |
| `#F1E5CB` → `#F6ECD8` | Front left panel, `linear-gradient(90deg, …)` |
| `#EFE2C6` → `#F5EAD5` | Front right panel, `linear-gradient(270deg, …)` |
| `#F7EEDB` → `#F3E7CF` | Front bottom panel, `linear-gradient(0deg, …)` |
| `#F4E9D2` → `#F2E5CB` | Flap front cream fill, `linear-gradient(180deg, …)` |
| `#F1E4C9` | Flap back cream fill (flat) |
| `#B38A45` 0%, `#E9D295` 35%, `#B8914C` 60%, `#E2C987` 85%, `#B08642` 100% | The gold edge gradient, `linear-gradient(135deg, …)`. Used three times: the front rim (`border-image`), the flap-front edge, the flap-back edge |
| `#D9BE7E` | Inset rule around the envelope liner |
| `#6F6869` | Envelope lettering ("You've been invited") |
| `rgba(110,80,50,…)` | Every envelope shadow, alphas `.12`/`.16`/`.2`/`.22`/`.3` |

#### Liner floral pattern (envelope interior + flap back)

| Hex | Role |
| --- | --- |
| `#F7E6EA` | Pattern ground |
| `#DFA7B5` | Large dot |
| `#EBC3CD` | Small offset dot |

#### Announcement card

| Hex | Role |
| --- | --- |
| `#F8E3E8` | Card ground and inner panel |
| `rgba(255,255,255,.95)` | Lace ring pattern and inner-panel hairline |
| `#6B6264` | Announcement text (Parisienne) |
| `rgba(120,70,85,.16)` | Card shadow |

#### Polaroid card

| Hex | Role |
| --- | --- |
| `#F8F4E4` → `#EEE8D1` | Photo mat, `linear-gradient(160deg, …)` |
| `#DCD6C4` | Photo well (the color behind the `<img>`) |
| `rgba(90,70,40,.2)` | Card shadow |

#### Date card

| Hex | Role |
| --- | --- |
| `#F2C8D2` | Scalloped card ground |
| `rgba(255,255,255,.95)` | The two dotted rules |
| `#2D2628` | Card text ("Save the Date", location, date) |
| `#5E4750` | "glass art" placeholder label |
| `rgba(60,40,45,.45)` | "glass art" dashed border |
| `rgba(120,60,80,.2)` | Card `drop-shadow` |

#### Floral sprig (one component, used 4×)

| Hex | Role |
| --- | --- |
| `#AFC098` → `#7F9A6E` | Leaf A, `linear-gradient(135deg, …)` |
| `#A3B78E` → `#7A9468` | Leaf B, `linear-gradient(135deg, …)` |
| `#F7D2DA` → `#E3A3B2` | Bud, `radial-gradient(circle at 35% 35%, …)` |
| `#D6A84E` | Bloom center |
| `#F4C2CD` | Bloom petals at 50%/24%, 75%/42%, 25%/42% |
| `#EDB0BF` | Bloom petals at 65%/73%, 35%/73% |

#### Petals (7 scattered)

| Hex | Role |
| --- | --- |
| `#F8D6DD` → `#EBAABA` (68%) → `#D98C9E` | Petal fill, `radial-gradient(ellipse at 32% 30%, …)` |
| `rgba(120,60,70,.18)` | Petal shadow |

#### Ribbon (visible only mid-animation)

| Hex | Role |
| --- | --- |
| `#E4A3B2` → `#F7D3DB` (45%) → `#E8ADBB` | Ribbon stem, `linear-gradient(90deg, …)` |
| `#EDB2C0` | Both bow loops (border color) |
| `#DE98A9` → `#F2C4CE` → `#E1A0B0` | Bow knot, `linear-gradient(90deg, …)` |
| `rgba(120,60,70,.2)` | Ribbon shadow |

#### Seal and prompt

| Hex | Role |
| --- | --- |
| `#7A2839` | "P&L" monogram, at `opacity: .82` |
| `rgba(255,220,225,.45)` / `rgba(90,20,35,.25)` | Monogram `text-shadow` (down / up) |
| `#5F5859` | "CLICK TO OPEN" arc text |

#### Note and CTA

| Hex | Role |
| --- | --- |
| `#2A2426` | Note copy |
| `#F3C9D3` | "SHARE YOUR ADDRESS" pill, the "BACK" control, and the "Back to invitation" control |
| `#1E1A1B` | CTA text; every Parisienne heading on the address page |

#### Address page

| Hex | Role |
| --- | --- |
| `#ffffff` | Form card surface |
| `#F3D3DA` | Form card border (2px) |
| `#BE5168` | Form `h2` ("Share your address", Lora 23px) |
| `#9E3D53` | Field labels; every focus outline |
| `#EDB8C4` | Field border, resting (1.5px); success check ring |
| `#B2334F` | Field border, invalid |
| `#2A2426` | Field text; success paragraph |
| `#6F6264` | "(optional)" tag and the address help text |
| `#A3304A` | Inline field error text |
| `#FBEFF2` / `#8E2A42` | Submission-error alert background / text |
| `#F6C8D0` / `#F2B9C4` / `#8E3348` | Submit button fill / hover fill / text |
| `rgba(178,71,94,.25)` | Field focus glow, `box-shadow: 0 0 0 3px …` |
| `#B2475E` | Success check stroke |

### Typography

Loaded from Google Fonts:
`Allura`, `Josefin Sans` (300, 400), `Lora` (400, 500, italic 400), `Parisienne`, `Pinyon Script`.

| Face | Used for |
| --- | --- |
| **Parisienne** | Couple names and announcement on the announcement card; the address-page `h1`; the "We can't wait to celebrate with you!" closing line; the "Thank you!" success heading |
| **Josefin Sans** (300) | "Save", "Date", and the numeric date `10.16.2027` |
| **Pinyon Script** | The word "the" on the date card; the "P&L" wax-seal monogram |
| **Lora** | "Trenton, Georgia"; the note copy; the "CLICK TO OPEN" arc; the CTA/BACK controls; every form label, input, help text, error and button |
| **Allura** | The envelope lettering, "You've been invited" |
| `ui-monospace, Menlo, monospace` | The prototype's own "CSS STAND-IN" tags and the "glass art" label — **tooling affordances, not design** |

### The scaling unit

The invitation is drawn in a fixed **455 × 779** design space and scaled with container queries.

- The stage frame sets `container-type: inline-size` and `aspect-ratio: 455/779`.
- Every size inside is written as `calc(N * 0.2198cqw)`, where `0.2198cqw` ≈ 1 design pixel
  (`1/455 = 0.2198%` of the container's inline size).
- Positions are plain percentages of the frame, so they need no unit.

This is why the design needs **no JavaScript measurement** to scale — a fact the prototype's own
animation code does not exploit (it measures `offsetWidth / 455` in JS instead).

### Frame sizing

```css
/* outer wrapper */
min-height: 100dvh; background: #FDF7F5; display: flex; justify-content: center;

/* main */
position: relative;
width: min(100vw, 560px);
min-height: 100dvh;
background: #FCF5F2 url(<floral>) center/cover no-repeat;
display: flex; flex-direction: column; align-items: center; justify-content: center;
overflow-x: hidden;

/* stage frame */
position: relative;
width: min(100vw, 560px, max(58.4dvh, 340px));
aspect-ratio: 455/779;
container-type: inline-size;
flex: none;
```

The `max(58.4dvh, 340px)` term is what keeps the whole invitation inside the viewport height on a
desktop window without ever shrinking below 340px wide.

## Routes

The prototype is a single file with three hash routes, parsed by
`(location.hash || '').replace(/^#\/?/, '')`:

| Hash | Internal name | What it shows |
| --- | --- | --- |
| `#/` (or none) | `closed` | The sealed envelope with the "CLICK TO OPEN" arc and the wax seal |
| `#/envelope-open` | `invite` | The opened envelope with three cards fanned out, petals, and the note + CTA |
| `#/share-your-address` | `address` | The address form |

`HANDOFF.md` says production should map these to real paths.

Visibility flags derived in `renderVals()`:

```
showAddress = formPreview !== 'live' || route === 'address'
showFrame   = !showAddress
showEnv     = !showAddress
showRig     = !showAddress && (route === 'closed' || opening)     // seal + prompt + button layer
showOpen    = !showAddress && route === 'invite'                  // cards, petals, ribbon, note
showEnvButton = route === 'closed' && !opening
flapZ         = route === 'invite' && !opening ? 2 : 6
flapTransform = route === 'invite' && !opening ? 'rotateX(178deg)' : 'rotateX(0deg)'
```

Note that the envelope (`showEnv`) stays mounted on the `invite` route — the opened invitation is
the *same* envelope with its flap laid back at `rotateX(178deg)` and its z-index dropped to 2.

## Section 1 — Closed envelope (`#/`)

All four envelope layers share the same box: `left: 13%; top: 42%; width: 74%; aspect-ratio: 8/5`,
and all four carry `transition: translate 180ms ease, scale 120ms ease` for the hover/press lift.

### Envelope back (`envBackRef`, z-index 1, `aria-hidden`)

- Body: `inset: 0; border-radius: 2px;`
  `background: linear-gradient(180deg, #E3D1AC 0%, #ECDEC1 55%, #F0E4CA 100%);`
  `box-shadow: 0 14px 26px -10px rgba(110,80,50,.3), 0 2px 5px rgba(110,80,50,.12)`
- Liner: `left: 3.5%; right: 3.5%; top: 4%; height: 66%;`
  `box-shadow: inset 0 0 0 calc(1*u) #D9BE7E`, and this two-layer dot pattern over `#F7E6EA`:

```css
background:
  radial-gradient(circle, #DFA7B5 0 calc(1.3*u), transparent calc(1.7*u))
    0 0 / calc(11*u) calc(11*u),
  radial-gradient(circle, #EBC3CD 0 calc(0.9*u), transparent calc(1.3*u))
    calc(5.5*u) calc(5.5*u) / calc(11*u) calc(11*u),
  #F7E6EA;
```

### Envelope front (`envFrontRef`, z-index 5, `aria-hidden`, `pointer-events: none`)

Three clip-path panels, each wrapped in its own `filter: drop-shadow(...)` element, plus a gold rim.

| Panel | `clip-path` | Fill | Wrapper shadow |
| --- | --- | --- | --- |
| Left | `polygon(0 0, 50% 56%, 0 100%)` | `linear-gradient(90deg, #F1E5CB, #F6ECD8)` | `drop-shadow(1px 0 1.5px rgba(110,80,50,.16))` |
| Right | `polygon(100% 0, 50% 56%, 100% 100%)` | `linear-gradient(270deg, #EFE2C6, #F5EAD5)` | `drop-shadow(-1px 0 1.5px rgba(110,80,50,.16))` |
| Bottom | `polygon(0 100%, 50% 36%, 100% 100%)` | `linear-gradient(0deg, #F7EEDB, #F3E7CF)` | `drop-shadow(0 -1px 2px rgba(110,80,50,.2))` |

Gold rim: `border: calc(1.6*u) solid transparent; border-image: <gold gradient> 1`.

### Flap (`flapWrapRef` → `flapRef`, z-index 6 or 2, `aria-hidden`, `pointer-events: none`)

Wrapper: `perspective: 760px; perspective-origin: 50% 0`.
Inner: `transform-origin: 50% 0; transform-style: preserve-3d; transform: rotateX(<0|178>deg)`.

Front face — `backface-visibility: hidden`, `filter: drop-shadow(0 1.5px 2px rgba(110,80,50,.22))`:

| Layer | `clip-path` | Fill |
| --- | --- | --- |
| Gold edge | `polygon(0 0, 100% 0, 50% 80%)` | `<gold gradient>` |
| Cream fill | `polygon(1.4% 0, 98.6% 0, 50% 77.6%)` | `linear-gradient(180deg, #F4E9D2, #F2E5CB)` |

Lettering: `left: 0; right: 0; top: 10%; text-align: center; font-family: Allura;`
`font-size: calc(36*u); line-height: 1; color: #6F6869; white-space: nowrap`

> You've been invited

Back face — `transform: rotateX(180deg)`, `backface-visibility: hidden`:

| Layer | `clip-path` | Fill |
| --- | --- | --- |
| Gold edge | `polygon(0 100%, 100% 100%, 50% 20%)` | `<gold gradient>` |
| Cream fill | `polygon(1.4% 100%, 98.6% 100%, 50% 22.4%)` | `#F1E4C9` |
| Liner pattern | `polygon(5% 97%, 95% 97%, 50% 28%)` | the liner dot pattern above |

### Seal layer (`sealLayerRef`, z-index 8)

- **Prompt arc** (`promptRef`, `aria-hidden`): an SVG at `left: 33%; top: 41%; width: 34%`,
  `viewBox="0 0 200 60"`, `overflow: visible`. Path `M20 48 A130 130 0 0 1 180 48`, and a
  `<textPath href="#promptArc" startOffset="50%" text-anchor="middle">` styled
  `font-family: Lora; font-size: 17px; letter-spacing: 1.5px; fill: #5F5859`:

  > CLICK TO OPEN

- **Seal** (`sealRef`): `left: 39.1%; top: 58%; width: 21.8%; aspect-ratio: 777/800`. The wax-seal
  PNG fills it, with the monogram centered on top:
  `font-family: 'Pinyon Script'; font-size: calc(19*u); line-height: 1; color: #7A2839;`
  `opacity: .82; text-shadow: 0 1px 0 rgba(255,220,225,.45), 0 -1px 0 rgba(90,20,35,.25)`

  > P&L

- **The button** (`envBtnRef`, only while `closed`): a single `<button type="button">` at
  `inset: -2%`, transparent, `border-radius: 6px`, `cursor: pointer`, `padding: 0`,
  focus `outline: 2px solid #9E3D53; outline-offset: 4px`. This is the whole interactive surface.

  `aria-label="You've been invited. Open the envelope."`

### Hover / press lift

Applied by JS to all four envelope layers at once (`setLift(translate, scale, shadow)`):

| Event | Effect |
| --- | --- |
| Pointer enter (mouse only, not reduced-motion, not opening) | `translate: 0 -3px` on all four layers; `filter: drop-shadow(0 8px 10px rgba(110,70,50,.16))` on the front |
| Pointer leave | reset |
| Pointer down | `scale: 0.99` |
| Pointer up | reset scale |

## Section 2 — Opened invitation (`#/envelope-open`)

### Accessible heading (`invHeadingRef`)

A visually-hidden, `tabindex="-1"` `<h1>` that is focused when the animation finishes:

> Peyton & Liane are getting married. Save the date: October 16, 2027, in Trenton, Georgia.

Hiding technique in the source: `position: absolute; width: 1px; height: 1px; overflow: hidden;`
`clip: rect(0 0 0 0); white-space: nowrap; margin: 0; outline: none`.

### Announcement card (`cardA`)

`left: 16.81%; top: 18.87%; width: 40.22%; height: 29.53%; z-index: 7;`
`transform: rotate(-9deg); background: #F8E3E8; box-shadow: 0 1px 4px rgba(120,70,85,.16)`

- Lace ring at `inset: calc(5*u)`:
  `background: radial-gradient(circle, transparent 34%, rgba(255,255,255,.95) 38%, rgba(255,255,255,.95) 54%, transparent 58%) 0 0 / calc(9*u) calc(9*u)`
- Inner panel at `inset: calc(14*u)`: `background: #F8E3E8; border: 1px solid rgba(255,255,255,.95)`
- Text block, `aria-hidden`, `inset: 0; padding-top: 21%; font-family: Parisienne; color: #6B6264;`
  `font-size: calc(27*u); line-height: 1.02; display: flex; flex-direction: column`:

  | Line | Offset |
  | --- | --- |
  | Peyton & | `margin-left: 21%` |
  | Liane | `margin-left: 40%` |
  | are getting | `margin-left: 27%; margin-top: 14%` |
  | married! | `margin-left: 42%` |

- Sprig at `left: -7%; top: -5%`, `rotate(-12deg)`
- Sprig at `right: -6%; bottom: -5%`, `rotate(160deg)`
- Prototype tag: `CSS STAND-IN` at `right: 6%; bottom: 2%`, color `#8A6470`

### Polaroid card (`cardP`)

`left: 12.31%; top: 42.49%; width: 41.32%; height: 29.78%; z-index: 7;`
`transform: rotate(-7deg); background: linear-gradient(160deg, #F8F4E4, #EEE8D1);`
`box-shadow: 0 2px 6px rgba(90,70,40,.2)`

- Photo: `left: 5.5%; top: 4.6%; width: 89%; height: 71%; object-fit: cover;`
  `object-position: 50% 45%; background: #DCD6C4`

  `alt="The couple smiling together outdoors among green trees, with an engagement ring visible"`

- Sprig at `left: -7%; bottom: -5%`, `rotate(200deg)`
- Prototype tag: `CSS FRAME · STAND-IN`, centered at `bottom: 6%`, color `#8A7A5E`

### Date card (`cardD`)

`left: 51.21%; top: 35.82%; width: 35.16%; height: 24.65%; z-index: 7;`
`transform: rotate(9.5deg); filter: drop-shadow(0 1px 3px rgba(120,60,80,.2))`

Scalloped body, `inset: 0; background: #F2C8D2`, with a two-layer repeating mask that bites
half-circles out of the top and bottom edges:

```css
mask:
  radial-gradient(circle at 50% 0,   transparent calc(2.4*u), #000 calc(2.7*u))
    top    / calc(8*u) 51% repeat-x,
  radial-gradient(circle at 50% 100%, transparent calc(2.4*u), #000 calc(2.7*u))
    bottom / calc(8*u) 51% repeat-x;
```

- Dotted rule: `left: 3%; right: 3%; top: calc(5*u); border-top: 1.5px dotted rgba(255,255,255,.95)`
- Dotted rule: `left: 3%; right: 3%; bottom: calc(5*u)`, same border
- **Missing-asset placeholder** for the champagne-glass illustration:
  `right: 8%; top: 9%; width: 27%; height: 25%; border: 1px dashed rgba(60,40,45,.45)`, centered
  monospace label `glass` / `art` at `calc(5.5*u)/1.1`, color `#5E4750`
- Text block, `aria-hidden`, `inset: 0; padding: 13% 9% 0; color: #2D2628; flex column`:

  | Line | Type |
  | --- | --- |
  | Save | Josefin Sans 300, `calc(31*u)`, `line-height: 1` |
  | the | Pinyon Script, `calc(21*u)`, `line-height: 1` |
  | Date | Josefin Sans 300, `calc(31*u)`, `line-height: 1.05` |
  | Trenton, Georgia | Lora, `calc(12.5*u)`, centered, `margin-top: 11%` |
  | 10.16.2027 | Josefin Sans 300, `calc(27*u)`, centered, `margin-top: 6%`, `letter-spacing: .02em` |

  "the" and "Date" share one row: `display: flex; align-items: baseline;`
  `gap: calc(4*u); margin-left: 2%`.

- Sprig at `right: -7%; bottom: -6%`, `rotate(35deg)`
- Prototype tag: `CSS STAND-IN` at `left: 8%; bottom: 6%`, color `#7E4B5A`

### Floral sprig — the shared decorative unit

One 22×22 design-unit box (`width: calc(22*u); height: calc(22*u)`), used four times at four
rotations. `aria-hidden`, `pointer-events: none`.

| Part | Geometry | Fill |
| --- | --- | --- |
| Leaf A | `left: -34%; top: 44%; width: 62%; height: 28%;` `border-radius: 0 100% 0 100%;` `rotate(-18deg)` | `linear-gradient(135deg, #AFC098, #7F9A6E)` |
| Leaf B | `right: -30%; top: 14%; width: 56%; height: 26%;` `border-radius: 100% 0 100% 0;` `rotate(-38deg)` | `linear-gradient(135deg, #A3B78E, #7A9468)` |
| Bud | `left: 78%; top: 78%; width: 30%; height: 30%;` `border-radius: 50%` | `radial-gradient(circle at 35% 35%, #F7D2DA, #E3A3B2)` |
| Bloom | `inset: 0` | six stacked radial gradients (below) |

```css
background:
  radial-gradient(circle at 50% 50%, #D6A84E 0 11%, transparent 12%),
  radial-gradient(circle at 50% 24%, #F4C2CD 0 21%, transparent 22%),
  radial-gradient(circle at 75% 42%, #F4C2CD 0 21%, transparent 22%),
  radial-gradient(circle at 65% 73%, #EDB0BF 0 21%, transparent 22%),
  radial-gradient(circle at 35% 73%, #EDB0BF 0 21%, transparent 22%),
  radial-gradient(circle at 25% 42%, #F4C2CD 0 21%, transparent 22%);
```

Placements: announcement card `-12deg` and `160deg`; polaroid `200deg`; date card `35deg`.

### Petal scatter (`petalsRef`, z-index 6, `aria-hidden`, `pointer-events: none`)

Seven petals across `inset: 0` of the frame. All share:

```css
border-radius: 50% 50% 46% 54% / 64% 60% 40% 36%;
background: radial-gradient(ellipse at 32% 30%, #F8D6DD, #EBAABA 68%, #D98C9E);
box-shadow: 0 1px 1.5px rgba(120,60,70,.18);
```

| # | left | top | width (u) | height (u) | rotate |
| --- | --- | --- | --- | --- | --- |
| 0 | 6% | 27% | 18 | 14 | 25deg |
| 1 | 86% | 23% | 16.2 | 12.6 | -35deg |
| 2 | 90% | 62% | 19.8 | 15.4 | 70deg |
| 3 | 4% | 69% | 17.1 | 13.3 | -20deg |
| 4 | 63% | 71% | 15.3 | 11.9 | 118deg |
| 5 | 73% | 15% | 18 | 14 | 40deg |
| 6 | 29% | 13% | 16.2 | 12.6 | -62deg |

### Ribbon (`ribbonRef`, z-index 3 → 8, `aria-hidden`, `pointer-events: none`)

Rendered **only while `opening` is true** — it rises out of the envelope and fades before the
animation ends. `left: 47.25%; top: 13.6%; width: 5.5%; height: 28.5%`.

- Stem: `inset: 0; background: linear-gradient(90deg, #E4A3B2, #F7D3DB 45%, #E8ADBB);`
  `box-shadow: 0 1px 2px rgba(120,60,70,.2)`
- Bow box: `left: 50%; top: 30%; width: calc(64*u); height: calc(24*u); translate(-50%, -50%)`
  - Left loop: `left: 0; top: 10%; width: 46%; height: 80%;`
    `border: calc(4*u) solid #EDB2C0; border-radius: 50%; rotate(-16deg)`
  - Right loop: `right: 0; top: 10%; width: 46%; height: 80%;` same border, `rotate(16deg)`
  - Knot: `left: 50%; top: 50%; width: calc(11*u); height: calc(13*u); translate(-50%, -50%);`
    `border-radius: calc(3*u); background: linear-gradient(90deg, #DE98A9, #F2C4CE, #E1A0B0)`

### Note and CTA (`noteRef`, z-index 6)

`left: 0; right: 0; top: 75.6%; display: flex; flex-direction: column; align-items: center;`
`gap: calc(36*u)`

Copy: Lora, `calc(12.5*u)`, `letter-spacing: .09em`, `line-height: 1.35`, centered, `#2A2426`,
with a hard `<br>`:

> formal invitation to follow, please
> share your address with us

Button: `min-height: 44px; min-width: 44px; padding: 0 8px`, transparent, `border-radius: 4px`,
focus `outline: 2px solid #9E3D53; outline-offset: 2px`. Inner pill span:
`background: #F3C9D3; padding: calc(5*u) calc(13*u); font-family: Lora; font-size: calc(12*u);`
`letter-spacing: .04em; color: #1E1A1B; text-decoration: underline; text-underline-offset: 2px`

> SHARE YOUR ADDRESS

## Section 3 — Address page (`#/share-your-address`)

Container (`addrRef`): `width: 100%; max-width: 440px;`
`padding: clamp(56px, 18vh, 190px) 20px 64px; display: flex; flex-direction: column;`
`align-items: center; gap: 22px`

### Page heading (`addrHeadingRef`, `tabindex="-1"`, focused on arrival)

`font-family: Parisienne; font-weight: 400; font-size: clamp(32px, 9vw, 48px);`
`letter-spacing: .04em; line-height: 1.1; color: #1E1A1B; text-align: center; white-space: nowrap`

> Share your address

### Form card

`width: 100%; background: #fff; border: 2px solid #F3D3DA; border-radius: 12px; padding: 24px 22px`

The form itself is `display: flex; flex-direction: column; gap: 18px` and carries `novalidate`.
Every field group is `display: flex; flex-direction: column; gap: 6px`.

**Card heading** — Lora 400, 23px, `#BE5168`:

> Share your address

**Shared field styles.** Labels: `font-family: Lora; font-size: 15px; color: #9E3D53`. Inputs:
`width: 100%; min-height: 44px; padding: 10px 12px; font: 16px Lora; color: #2A2426;`
`background: #fff; border: 1.5px solid <#EDB8C4 | #B2334F>; border-radius: 8px; outline: none`,
focus `box-shadow: 0 0 0 3px rgba(178,71,94,.25)`. Inline errors:
`font: 14px/1.4 Lora; color: #A3304A`.

| Field | `id` | Label | Attributes | Notes |
| --- | --- | --- | --- | --- |
| Name | `f-name` | Your name | `type="text" autocomplete="name" required` | |
| Email | `f-email` | Enter your email **(optional)** | `type="email" inputmode="email" autocomplete="email"` | "(optional)" is a nested span, `font-size: 13px; color: #6F6264`; the label is `display: flex; gap: 6px; align-items: baseline` |
| Address | `f-address` | Share your address | `rows="4" autocomplete="street-address" required` | `<textarea>`; `min-height: 104px; font: 16px/1.45 Lora; resize: vertical`; `aria-describedby="help-address err-address"` |

Address help text (`id="help-address"`), `font: 13.5px/1.45 Lora; color: #6F6264`:

> Include your street address, apartment or unit, city, state or province, postal code, and country.

**Submission-error alert**, `role="alert"`, shown when status is `error`:
`padding: 10px 12px; border-radius: 8px; background: #FBEFF2; font: 14.5px/1.45 Lora; color: #8E2A42`

> We couldn't send your address. Please try again.

**Submit button**: `margin-top: 6px; width: 100%; min-height: 46px; border: none;`
`border-radius: 999px; background: #F6C8D0; color: #8E3348; font: 15px Lora;`
`letter-spacing: .12em; text-transform: uppercase`, hover `background: #F2B9C4`,
focus `outline: 2px solid #9E3D53; outline-offset: 3px`. `disabled`/`aria-disabled` while sending.

| Status | Label |
| --- | --- |
| not sending | Send address |
| sending | Sending… |

### Validation

Client-side only, in `validate(v)`:

| Field | Rule | Message |
| --- | --- | --- |
| Name | non-empty after `trim()` | Please enter your name. |
| Email | **optional**; if non-empty, must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | Please enter a valid email address. |
| Address | non-empty after `trim()` | Please enter your mailing address. |

An error shows when the field has been blurred (`touched`) **or** the form has been submitted.
On an invalid submit, focus moves to the first invalid field in the order `name, email, address`.

### Success state

Replaces the form inside the same card. `display: flex; flex-direction: column; align-items: center;`
`gap: 10px; text-align: center; padding: 10px 0 4px`

- Check mark: a 52×52 SVG, `aria-hidden`. `<circle cx=26 cy=26 r=24 fill=none stroke=#EDB8C4 stroke-width=2>`
  and `<path d="M16 27 L23 34 L37 19" fill=none stroke=#B2475E stroke-width=2.5 stroke-linecap=round
  stroke-linejoin=round stroke-dasharray=40>`. The path's `stroke-dashoffset` animates 40 → 0 over
  340ms `ease-out` (skipped under reduced motion).
- Heading (`tabindex="-1"`, focused on success): Parisienne, 40px, `#1E1A1B`

  > Thank you!

- Body: `font: 16px/1.55 Lora; color: #2A2426; text-wrap: pretty`

  > Your address has been received. We can't wait to celebrate with you!

- Control: `min-height: 44px; padding: 8px 16px; background: #F3C9D3; font: 16px Lora;`
  `color: #1E1A1B; text-decoration: underline`

  > Back to invitation

### Footer row

`width: 100%; display: flex; justify-content: space-between; align-items: center;`
`flex-wrap: wrap; gap: 16px`

- Back control: `min-height: 44px; padding: 6px 12px; background: #F3C9D3; font: 19px Lora;`
  `color: #1E1A1B; text-decoration: underline`

  > BACK

- Closing line, **only while the form is showing** (hidden on success): Parisienne, 26px,
  `line-height: 1.15`, `#1E1A1B`, right-aligned, with a hard `<br>`:

  > We can't wait to
  > celebrate with you!

### Submission behavior

`submit` → validate → if invalid, `status: 'invalid'` and focus the first bad field. Otherwise
`status: 'sending'`, then after a **1400ms** `setTimeout`, `status: 'success'` (or `'error'` when
the `simulateOutcome` prop is set to `error`). The comment in the source is explicit:

> `// Simulated submission — no data leaves the browser.`

## The opening animation

Triggered by `activate()` on the envelope button, and only from the `closed` route. Under
`prefers-reduced-motion: reduce` it is **skipped entirely** — the route flips straight to
`#/envelope-open`.

Every duration and delay below is multiplied by the `animSpeed` prop (range 1–2.5, **default 1.6**).
The numbers in the table are the unmultiplied design values. `u` is the design unit
(`offsetWidth / 455` in the prototype's JS; `0.2198cqw` in CSS).

Two easing curves are reused:

- `E = cubic-bezier(0.22, 1, 0.36, 1)`
- `S = cubic-bezier(0.25, 1, 0.3, 1)`

### Envelope geometry used by the card math

```
ex   = 455 * 0.5             = 227.5      // envelope center x, design units
et   = 779 * 0.42            = 327.18     // envelope top y
eh   = 455 * 0.74 * 0.625    = 210.4375   // envelope height (74% wide, 8:5)
inY  = et + eh * 0.6         = 453.4425   // start y, inside the pocket
outY = et - 110              = 217.18     // rise y, above the envelope
```

### Timeline

| Element | Delay | Duration | Keyframes |
| --- | --- | --- | --- |
| Prompt arc | 0 | 140 | `opacity: 1 → 0` |
| Seal | 100 | 260, `ease-out` | `translateY(0) rotate(0) op 1` → @0.55 `translateY(-10u) rotate(-3deg) op 1` → `translateY(-12u) rotate(-3deg) op 0` |
| Flap | 240 | 720, `cubic-bezier(0.5,0,0.3,1)` | `rotateX(0)` → @0.08 `rotateX(-4deg)` → @0.5 `rotateX(90deg)` → `rotateX(178deg)` |
| Flap wrapper `z-index` | 240 | 720, same | `6` → `6`@0.5 → `2`@0.501 → `2` |
| Cards | 780 | see below | see below |
| Ribbon | 780 | 1370 | see below |
| Petal *i* (0…6) | 1950 + *i*·70 | 520, `ease-out` | `op 0, translate 0 -8u` → `op 1, translate 0 0` |
| Note | 2000 | 260, `ease-out` | `op 0, translateY(6u)` → `op 1, none` |

### Card choreography

Each card starts scaled down and buried in the pocket, rises straight up out of the envelope, holds,
then settles into its final rotated resting place. `T0 = 780`, `T1 = 1420`.

```
per card i: S0 = T1 + i*90,  S1 = 2150 + i*60,  d = S1 - T0
start = translate((ex-cx)u, (inY-cy)u) rotate(0deg)  scale(0.82)
rise  = translate((ex-cx)u, (outY-cy)u) rotate(0deg) scale(0.9)
final = translate(0, 0)                rotate(R)     scale(1)
```

| Card | cx | cy | R | Δx (u) | start Δy (u) | rise Δy (u) | delay | duration |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `cardA` (announcement, i=0) | 168 | 262 | -9deg | +59.5 | +191.4425 | -44.82 | 780 | 1370 |
| `cardD` (date, i=1) | 313 | 375 | 9.5deg | -85.5 | +78.4425 | -157.82 | 780 | 1430 |
| `cardP` (polaroid, i=2) | 150 | 447 | -7deg | +77.5 | +6.4425 | -229.82 | 780 | 1490 |

Keyframe offsets, and the `z-index` step that brings a card in front of the envelope exactly as it
clears the pocket (`z = (T1 - T0) / d`):

| Card | offsets | `z-index` step |
| --- | --- | --- |
| `cardA` | `0` start (ease `E`) → `0.46715` rise (ease `S`) → `1` final | `3` → `3`@`0.46715` → `7`@`0.46815` → `7` |
| `cardD` | `0` start (`E`) → `0.44755` rise (`linear`) → `0.51049` rise (`S`) → `1` final | `3` → `3`@`0.44755` → `7`@`0.44855` → `7` |
| `cardP` | `0` start (`E`) → `0.42953` rise (`linear`) → `0.55034` rise (`S`) → `1` final | `3` → `3`@`0.42953` → `7`@`0.43053` → `7` |

`cardA` has no hold segment (its `S0` equals `T1`), so its rise keyframe takes easing `S` directly.

### Ribbon choreography

`delay 780`, `duration 1370`, with `t1 = 0.46715`, `t2 = 0.51095`, `t3 = 0.74453`:

| Offset | State |
| --- | --- |
| 0 | `translateY(236.2625u) scale(0.91)`, `opacity 1`, ease `E` |
| `t1` | `translateY(0) scale(1)`, `opacity 1` |
| `t2` | same, ease `ease-in` |
| `t3` | `translateY(18u) scale(1)`, `opacity 0` |
| 1 | unchanged from `t3` |

`z-index`: `3` → `3`@`t1` → `8`@`t1 + 0.001` → `8`.

### Termination and safety nets

The prototype races three finishers: `Promise.all` over every animation's `finished`, a
`setTimeout` at `2700 * animSpeed`, and an outer safety `setTimeout` at `3000 * animSpeed`. It also
calls `finish()` on `resize` and when `prefers-reduced-motion` flips on mid-animation. `finish()`
sets `opening: false` and moves focus to the hidden `<h1>`.

At the default `animSpeed` of 1.6, the last petal's animation ends at
`(1950 + 6*70 + 520) * 1.6 = 4624ms`, which is *after* the `2700 * 1.6 = 4320ms` finish timer — so
the prototype cancels the tail of the petal fade-in and snaps the petals to their resting state.

### Route and focus transitions (outside the opening animation)

| Transition | Behavior |
| --- | --- |
| Mount | Fade the active view in over 300ms (120ms under reduced motion) |
| → address | Fade + 10px lift in over 260ms; focus the address `<h1>` |
| address → invite | Fade in over 260ms; restore the saved `window.scrollY`; focus the hidden `<h1>` |
| Leaving a view | Fade out + `translateY(-10px)` over 180ms (100ms reduced), then navigate |
| Back from address | `history.back()` if this session pushed the address route, else set the hash to `#/envelope-open` |

## Prototype-only affordances — do not port

- The `animSpeed`, `markStandIns`, `simulateOutcome` and `formPreview` props, and the
  `<sc-if>` / `{{ }}` / `ref="{{ }}"` templating — all `support.js` machinery.
- The `CSS STAND-IN` / `CSS FRAME · STAND-IN` monospace tags on the three cards.
- The dashed `glass art` box on the date card (it marks a missing Canva export).
- The Canva `_assets/media/...` absolute image URLs.
