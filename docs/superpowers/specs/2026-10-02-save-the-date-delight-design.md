# Save the Date — delight pass

Status: approved by the couple on 2026-10-02 ("do it all"), with one change: no gold.

## Goal

The card now only needs to say four things: **Peyton & Liane**, **10.16.2027**, **Trenton,
Georgia**, and **formal invitation to follow**. With less to say, each fact gets its own moment,
and the whole piece gets prettier and more delightful without losing elegance.

## Palette: warm pastel blush, ivory, a hint of sage — no gold

The couple supplied Pantone swatches (P 75-1 C, P 75-9 C, Intimate Pink, Raindrops on Roses,
Sugar Swizzle) and a mood board of blush and peach-pink roses, ivory linen, candlelight and soft
greenery. The palette starts from the swatches and warms them toward the mood board's rose:

| Role | Colour |
| --- | --- |
| Page / stage | Ivory blush `#fbf3f0` / `#fdf8f5` |
| Announcement card | Blush `#fbe3df` |
| Date card | Pastel rose `#f6cfcc` |
| Envelope | Warm ivory with a blush tint; rose-pearl rim in place of gold |
| Text inks | Deep rose `#94505b` / `#9a5560`, near-black `#3d2c2f` |
| Accent line work | Pastel sage `#b5c4a5` / `#9fb08f` |
| Photographic assets | The floral art and wax seal are softened with CSS filters to sit in the palette |

The inspiration photos do include gold (cutlery, chargers, hanging stars). Gold is left out at the
couple's request; it can be reintroduced through `--std-env-edge` and `--std-foil` alone.

"Foil" means a **rose-pearl foil**: a deep-rose text gradient with a pale blush highlight that
sweeps across slowly. It is used only on the names.

## The opening, as a sequence of beats (under ~5s)

1. **Sealed envelope.** Above it, "YOU HAVE MAIL FROM" and **Peyton & Liane** in rose-pearl
   script that writes on as the page loads; below it, "CLICK THE ENVELOPE TO OPEN" (or "TAP" on a
   touch screen). The flap itself carries no writing. The envelope floats gently and a pearl sheen sweeps across it every few seconds. A round
   postmark, `TRENTON, GA · 10.16.27`, stamps onto the corner shortly after load, beside a small
   pink postage stamp — guests see the date and city before they open anything.
2. **The seal cracks.** On tap the seal splits into two halves that tumble away, with a small burst
   of pink and white sparkles, then the flap opens (existing choreography).
3. **Cards fly out** as before, landing with a slight springy overshoot. (An earlier petal
   burst that left petals lying still on the page was dropped: still petals pulled attention
   from the falling ones.)
4. **Names write on** — each announcement line is revealed left-to-right with a soft ink-wipe mask
   (a masked reveal of the real font, not a stroke-by-stroke tracing), in rose-pearl foil.
5. **The date**: the date card shows a week strip, `OCTOBER 2027 / 10 11 12 13 14 15 16`, and a
   hand-drawn heart draws itself around the 16 (a Saturday).
6. **The city**: "Trenton, Georgia" rises in, over a faint sage ridgeline sketch that draws on — a
   nod to the Lookout Mountain ridges around Trenton.
7. **The photo develops** from a pale blank into full colour, with a handwritten caption on the
   Polaroid's strip.
8. **"Formal invitation to follow"** fades in last, then a live `DAYS : HOURS : MINUTES : SECONDS` countdown under "The countdown is on!" and two
   quiet links: **Add to calendar** and **Open again**.

Throughout, a dozen petals drift down slowly on staggered loops — some already mid-fall when
the invitation opens — and the cards shift subtly with the pointer for depth (pointer only — no
device-orientation permission prompt).

## Extras

- **Add to calendar** links a static all-day `.ics` file in `public/` (no server code).
- **Open again** reseals the envelope and returns focus to it.
- **Countdown** ticks every second to midnight Eastern on 16 October 2027 (to be moved to the
  ceremony time once known). It is computed on the client only, says "Today's the day!" on the
  day, and disappears afterwards. The ticking digits are hidden from assistive technology, which
  gets one plain sentence instead of a live region that would interrupt every second.
- **Link preview**: a designed 1200×630 `opengraph-image.png` / `twitter-image.png` with alt text,
  rendered once from an HTML mock-up with the real fonts and assets and committed as static files.

## Accessibility and motion

- Reduced motion keeps the existing contract: every new animation shorthand is `none` and each
  element's resting classes are its final state. Infinite loops (float, sheen, drifting petals,
  foil sweep) are off. Parallax is off.
- The visually-hidden `<h1>` still carries the whole announcement; decorative pieces stay
  `aria-hidden`. The countdown and both links are real, focusable content.

## Out of scope

Sound, flip cards, and anything that stores data.
