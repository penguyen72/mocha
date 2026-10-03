# Save the Date

Save the Date is Peyton and Liane's save-the-date card: a sealed envelope that opens into the
announcement: the couple, the date, the city, and a note that the formal invitation will follow.
See the
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
| `/#open` | The opened invitation, with no animation — so a reload or shared link stays open. |
| `/peyton-and-liane.ics` | The static all-day wedding event used by the Apple subscription and calendar-file download. |

## How it is built

The invitation is drawn in a fixed 455 × 779 design space and scaled by a container query on the
stage frame, so `--std-u` (`0.2198cqw`) is one design pixel. That makes every value in the opening
choreography a static number, so the whole sequence is CSS `@keyframes` in `src/app/globals.css`
rather than JavaScript — no measurement, no resize listener, no animation library in this app.

`src/components/invitation-stage.tsx` and `src/components/countdown.tsx` are the only client
components. The countdown ticks once a second toward midnight Eastern on the wedding day
(`WEDDING_START` in `src/components/invitation-content.ts` — change it to the ceremony time once
known). It reads the visitor's clock on the client only, so it never appears in the prerendered HTML. `--std-*` is this app's local palette and is **not** part of the shared `@mocha/ui`
token contract.

## Add to calendar

The invitation's **Add to calendar** button reveals Google Calendar, Apple Calendar, and a
calendar-file download. Google opens a prefilled event in a new tab for the guest to save.
Apple opens a `webcal:` subscription to the `.ics` file on the current host; the chooser explains
that this adds a subscribed calendar. A device without a calendar protocol handler can use the
download option to import the file into Apple Calendar on Mac, Outlook, or another calendar app.

All options save October 16, 2027 as an all-day event in Trenton, Georgia, with a note that the
formal invitation will follow. The exclusive end date is October 17. If these details change,
update both `GOOGLE_CALENDAR_HREF` in `src/components/invitation-content.ts` and
`public/peyton-and-liane.ics`; the calendar test checks that they agree. Imported files and
Google's saved copies do not receive subsequent website updates. Apple's subscribed calendar
can refresh the hosted file.

The chooser supports Tab navigation, Escape to close and restore focus, and dismissal when
focus moves away or the guest taps elsewhere. It uses the invitation's existing client boundary.

The design this was ported from is recorded in
[`docs/superpowers/reference/save-the-date-dc-source.md`](../../docs/superpowers/reference/save-the-date-dc-source.md),
with the approved design in
[`docs/superpowers/specs/2026-09-23-save-the-date-design.md`](../../docs/superpowers/specs/2026-09-23-save-the-date-design.md).

The palette is built from the couple's Pantone swatches (listed at the top of `src/app/globals.css`):
near-whites and dusty pinks, with deeper dusty-rose inks for text and a hint of pastel sage. There
is deliberately no gold. The opening's beats, and the reasoning behind them, are in
[`docs/superpowers/specs/2026-10-02-save-the-date-delight-design.md`](../../docs/superpowers/specs/2026-10-02-save-the-date-delight-design.md).

## Link preview

`src/app/opengraph-image.jpg` and `src/app/twitter-image.jpg` are the card shown when the link is
texted or posted. They are static files rendered from `design/link-preview.html`; to change the
preview, edit that page, open it in Chrome at 1200 × 630, and replace both images with a new
screenshot. In production Vercel supplies the absolute URL these tags need; if the app is ever
hosted elsewhere, set `metadataBase` in `src/app/layout.tsx`.

## Known gaps

- **The champagne-glass illustration is missing.** The design prototype drew a dashed placeholder
  box on the date card to mark it. That box is deliberately not ported — in production it would read
  as a rendering bug — so the date card is slightly barer than the design until the export arrives.
- **Opening the envelope needs JavaScript.** The prerendered HTML is the sealed envelope, so a
  visitor with JavaScript disabled sees the envelope but cannot open it.
