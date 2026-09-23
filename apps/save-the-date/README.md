# Save the Date

Save the Date is Peyton and Liane's save-the-date card: a sealed envelope that opens into the
announcement, and a page for guests to send their mailing address. See the
[repository guide](../../README.md) for workspace commands, verification, and deployment.

Run this app with pnpm:

```bash
pnpm --filter @mocha/save-the-date dev
```

It runs at http://localhost:3002.

## Routes

| Route | What it shows |
| --- | --- |
| `/` | The sealed envelope. Opening it plays the choreography and settles on the invitation. |
| `/#open` | The opened invitation, with no animation — where both back controls return to. |
| `/share-your-address` | The address form. |

## How it is built

The invitation is drawn in a fixed 455 × 779 design space and scaled by a container query on the
stage frame, so `--std-u` (`0.2198cqw`) is one design pixel. That makes every value in the opening
choreography a static number, so the whole sequence is CSS `@keyframes` in `src/app/globals.css`
rather than JavaScript — no measurement, no resize listener, no animation library in this app.

`src/components/invitation-stage.tsx` and `src/components/address-form.tsx` are the only client
components. `--std-*` is this app's local palette and is **not** part of the shared `@mocha/ui`
token contract.

The design this was ported from is recorded in
[`docs/superpowers/reference/save-the-date-dc-source.md`](../../docs/superpowers/reference/save-the-date-dc-source.md),
with the approved design in
[`docs/superpowers/specs/2026-09-23-save-the-date-design.md`](../../docs/superpowers/specs/2026-09-23-save-the-date-design.md).

## Known gaps

- **Three images are placeholders.** The floral background, the couple photograph and the wax seal
  live in Canva and were never exported into the design project. Each renders as a CSS gradient
  built from app-local tokens. The photograph's intended alt text is preserved in
  `src/components/invitation-content.ts` as `PHOTO_ALT`, ready for the real file.
- **The champagne-glass illustration is missing.** The design prototype drew a dashed placeholder
  box on the date card to mark it. That box is deliberately not ported — in production it would read
  as a rendering bug — so the date card is slightly barer than the design until the export arrives.
- **The address form does not submit anywhere.** `src/components/address-submit.ts` is the single
  seam: it validates and resolves after a short delay, and the form's error state is driven by that
  promise rejecting. Wiring a real endpoint or form provider there makes the whole status machine
  live. Nothing is stored or sent today.
- **Opening the envelope needs JavaScript.** The prerendered HTML is the sealed envelope, so a
  visitor with JavaScript disabled sees the envelope but cannot open it.
