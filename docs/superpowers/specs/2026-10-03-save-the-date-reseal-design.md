# Save the Date: Resealing the Envelope

**Status:** Approved (option B, "tuck and seal") on 2026-10-03

## Problem

"Open again" on the opened invitation snaps straight back to the sealed envelope. The opening
is a five-second choreography; the way back has none.

## Design

A new `closing` phase sits between `open` and `closed`. In it, the invitation goes back into
the envelope in about three seconds, then the stage settles into `closed` exactly as before
(the "you have mail" header writes itself back on, the envelope floats, focus returns to the
envelope).

| Beat | Start | Length | What happens |
| --- | --- | --- | --- |
| Clear away | 0ms | 320ms | The note, countdown and links sink out; the cards' sprigs and the petals go. |
| Gather | 150 / 250 / 350ms | until 1100ms | Photo, then date, then announcement card straighten and lift to where each peaked on the way out, forming a stack above the pocket. |
| Tuck | 1150ms | 600ms | The whole stack slides into the pocket together. |
| Stage | 1500ms | 1000ms | The stage drifts back down to its sealed height. |
| Flap | 1650ms | 800ms | The flap folds back down over the cards (the opening's flap keyframes backwards). |
| Seal | 2350ms | 420ms | A whole wax seal presses onto the flap's point with a small squash. |
| Sparkles | 2500ms | 600ms | The opening's sparkles burst from the seal. |
| Postmark | 2550ms | 420ms | The postmark rises back in (no re-stamp; that was option C). |

The cards do not replay their opening keyframes backwards: that sent each card high above
the envelope and back, and its z-index step made cards pass behind one another mid-air.
Instead every card changes layer at the same moment, as the stack starts down.

`CLOSING_DURATION_MS` (3100) mirrors the last beat and must stay in step with `globals.css`.

The exits are one-shot; nothing loops or pulses (see the no-fading preference). Under reduced
motion, "Open again" still goes straight to the sealed envelope, and switching reduced motion
on mid-close settles immediately.

While closing, the note is `inert` so "Open again" cannot be pressed twice, and the URL hash
is cleared at the start, as before.
