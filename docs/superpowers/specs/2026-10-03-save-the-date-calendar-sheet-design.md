# Save the Date — calendar sheet

Status: approved by Peyton on 2026-10-03, from browser mockups (bottom sheet "D" with notecard
"A"'s row descriptions, and the same sheet centred as a dialog on desktop).

## Goal

Make **Add to calendar** feel as considered as the rest of the invitation, and make the Apple
option add one event instead of subscribing the guest to a new calendar.

## Problem

- The current chooser is a small plain dropdown of three text links above the button.
- The Apple option links to `webcal://<host>/peyton-and-liane.ics`. A `webcal:` link asks Apple
  Calendar to **subscribe** to the file, so guests get a separate, read-only calendar named after
  the file, with refresh settings, instead of one event in their own calendar. The `.ics` file is
  valid; only the link scheme is wrong.

## Design

### One sheet, two layouts

Tapping **Add to calendar** opens a modal `<dialog>` (`showModal()`). The browser supplies the
backdrop, the focus trap, Escape to close and an inert page behind it, and the top layer keeps the
sheet from being clipped or scaled by the invitation stage.

The same markup has two layouts, switched by a width media query:

- **Phone:** pinned to the bottom edge, full width, rounded top corners, slides up.
- **Desktop:** centred, 372px wide so the date and place fit on one line, fades and lifts in.

With `prefers-reduced-motion: reduce`, it appears without movement. The backdrop is a translucent
wash of the invitation's dark ink. No drag handle and no swipe-to-dismiss.

### Content

All copy lives in `invitation-content.ts`, as the existing copy does.

1. **Header:** a small date tile in the date-card pink (`OCT` over `16`), the title
   "Peyton & Liane's Wedding", and "Saturday, October 16, 2027 · Trenton, Georgia". The title is
   the dialog's accessible name.
2. **Three rows**, each an icon in a blush circle, a name, and a hint, separated by hairlines:

   | Name               | Hint                  | Link                                                   |
   | ------------------ | --------------------- | ------------------------------------------------------ |
   | Google Calendar    | Opens in a new tab    | `GOOGLE_CALENDAR_HREF`, new tab                        |
   | Apple Calendar     | iPhone, iPad & Mac    | `/peyton-and-liane.ics` (no `download` attribute)      |
   | Outlook & others   | Download an .ics file | `/peyton-and-liane.ics` with `download`                |

3. **"Not now"**: one text button at the bottom, in both layouts.

The icons are simple monoline glyphs in the accent ink, not official brand artwork.

### Closing

The sheet closes on Escape, a click on the backdrop, "Not now", or choosing any of the three
links. Focus always returns to the **Add to calendar** button.

### Apple fix

The Apple row links to the plain `.ics` file over the page's own origin. iPhone and iPad Safari
then show the add-event sheet for the single event, and a Mac opens Calendar's import prompt. The
`window.location` code that built the `webcal:` URL is removed. Next must serve the file as
`text/calendar`. Implementation confirms that and adds a header in `next.config.ts` only if it
does not.

Trade-off: an imported event no longer receives later edits to the hosted file. Google's saved
copy and the downloaded file already behave that way, and the formal invitation will follow
regardless.

## Out of scope

- No change to the event details, the `.ics` contents, or the Google link.
- No calendar-provider links beyond these three.

## Testing

Update `invitation-note.test.tsx` to cover:

- The sheet opens as a modal dialog named by the event title, only on request.
- The three links have the right hrefs, the hints are shown, and no link uses `webcal:`.
- Escape, "Not now", a backdrop click, and choosing a link each close it and restore focus.
- Google and the `.ics` file still describe the same event (existing test kept).

If jsdom lacks `HTMLDialogElement.showModal`/`close`, add a minimal stand-in to `vitest.setup.ts`.
Update the README's **Add to calendar** section. Run `pnpm lint`, `pnpm typecheck`, `pnpm test` and
`pnpm build` from the root, and the `design-review` skill, at phone and desktop widths.
