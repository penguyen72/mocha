# Save the Date — garden frame

Status: approved by the couple on 2026-10-03 ("i like it"), from mockup option D, refined
(https://claude.ai/artifact/Tn8nH1gnUEAz8trH8dahpp).

## Goal

Make the sealed-envelope page (the first thing a guest sees) fuller and prettier without changing
what it says or how the envelope opens.

## Problems with the current page

- The floral artwork (1107 × 2399) is taller and narrower than the page, and `object-cover`
  crops its top and bottom. That trims the frame's corners and half of the bottom-left roses,
  and leaves the bottom quarter of the page looking empty.
- The envelope is nearly the same blush as the page, so it reads flat.
- The postmark hangs off the envelope's top edge.
- "YOU HAVE MAIL FROM" is near-black while the rest of the header is rose.

## Design

1. **Whole floral frame.** The artwork is drawn at the stage's width and shown in two halves:
   the top half pinned to the top of the page and the bottom half to the bottom, with a soft
   fade where they meet in the plain middle of the frame. Both frame corners and all four rose
   clusters are always fully visible, and the roses scale with the card. The artwork blooms in
   on load (fade in from 105% scale).
2. **Candlelight.** A soft ivory glow behind the names and the envelope pushes the pink
   watercolor back so both stay legible.
3. **Header.** It moves down to sit inside the frame, clear of the top-left roses.
   "YOU HAVE MAIL FROM" turns rose with wider tracking, the names are slightly larger, and a small
   sprig (a rose bud between two hairlines) finishes the header.
4. **Envelope paper.** A warmer, deeper blush with grain, a longer shadow and a fine white edge
   along the flap. The envelope's geometry is unchanged, so the opening choreography is too.
5. **Postmark seated on the envelope.** The stamp and postmark sit on the envelope's top-right
   corner and stamp down later in the intro.
6. **Seal.** It gets a soft drop shadow and a light shimmer every few seconds, and it swells
   slightly while the envelope is hovered.
7. **Prompt.** "CLICK/TAP THE ENVELOPE TO OPEN" sits closer to the envelope between two
   hairlines. It stays steady rather than pulsing (the couple preferred it still).
8. **Petals at three depths.** The falling petals stay a surprise for when the envelope opens,
   as before, but now drift at three depths: small soft ones behind the cards, crisp ones in the
   middle, and two large blurred ones in front of everything. (The mockup showed them on the
   sealed page; the couple preferred keeping them for the opening.)
9. **Paper texture.** A faint printed-paper tooth across the whole page.
10. **Readable countdown.** Once the card is open, the bottom roses sit behind the note and
    countdown. The countdown's heading, colons and labels move to a deeper rose, the note and
    digits to a deeper ink, and the text gets a faint ivory halo. The roses behind are left
    untouched. Chosen from options mocked up at
    https://claude.ai/artifact/JbE5BbjSNrUqoxQAn8rHZy (option E). Option F added a candlelight
    glow behind the block, but the couple found the white fade distracting and it was removed.
11. **Centred opened card.** Once open, the stage rises a further 2.5% so the cards, note and
    links sit centred in the floral frame. While opening it drifts up in one soft motion (0.9s to 2.5s), fastest while the cards rise
    out of the envelope and settled before they land; arriving
    at `#open` starts there directly, and the sealed envelope keeps its position.

## Intro sequence

Roses bloom in (0–1.6s), the eyebrow rises (0.15s), the names write on (0.4s), the sprig rises
(1.5s), the postmark stamps down (1.7s), and the prompt rises (2s).

## Reduced motion

Every new animation joins the existing `prefers-reduced-motion` block. Everything appears in its
resting place, the shimmer stops, and the petals stay hidden, as they do today.

## Out of scope

The opened invitation's cards and record player, and all copy, are unchanged.
