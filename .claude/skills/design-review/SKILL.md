---
name: design-review
description: Use after any visual, layout, typography, animation, or form change to canton, blackberry, or save-the-date, before telling the user the work is done, or when the user says "review the design".
---

# Design review

Compare each changed screen against how it looked before the change. Every difference must trace back to something the user asked for. Anything else is a regression: fix it, then run the review again. Report only failures and fixes.

The review checks for unintended change. It does not lock the current layout: when the user asks for a new structure, that difference is expected.

## 1. Capture before and after

| App | Package | Port | Base port |
|---|---|---|---|
| canton | `@mocha/canton` | 3000 | 3100 |
| blackberry | `@mocha/blackberry` | 3001 | 3101 |
| save-the-date | `@mocha/save-the-date` | 3002 | 3102 |

Routes are every `page.tsx` under the app's `src/app/`, plus the extra states in **App notes**.

```bash
S=.claude/skills/design-review/scripts
BASE=$(git merge-base HEAD origin/main)
git worktree add --detach tmp/design/base-src "$BASE"
(cd tmp/design/base-src && pnpm install --frozen-lockfile)
# Run the base on its base port and the change on its normal port, both in the background:
#   (cd tmp/design/base-src && pnpm --filter <package> exec next dev --port <base port>)
#   pnpm --filter <package> dev
node $S/capture.mjs --origin http://localhost:<base port> --routes <routes> --out tmp/design/base
node $S/capture.mjs --origin http://localhost:<port> --routes <routes> --out tmp/design/head
node $S/compare.mjs tmp/design/base/layout.json tmp/design/head/layout.json
```

The capture checks widths 360, 390, 430, 768, 1024, and 1440, finishes animations, and writes a screenshot per screen. It uses device emulation because headless Chrome's `--window-size` will not go below 500px. If a `viewport is …px` line appears, the capture is invalid; fix that before judging anything else.

When done, stop both servers and run `git worktree remove tmp/design/base-src`.

## 2. Judge every difference

For each line `compare.mjs` prints:

- **Font changed** (family, size, weight, spacing, case, color): a regression unless the user asked to change that text's styling.
- **Moved higher or lower, or resized**: a regression unless the request explains it. If one element moved, find the cause; a nudge often moves everything below it.
- **No longer centered**: a regression unless asked.
- **Added or removed**: must match the request.
- **Error lines** (console errors, failed requests, HTTP 4xx/5xx): fix any that are not marked `(already in base)`.
- **Horizontal overflow**, or a **form field under 16px**: fix it.

## 3. Look at the screenshots

Compare the base and head screenshots of every changed screen, at 390 and 1440 at least. The diff cannot judge these:

- The main column and headings sit centered in the viewport.
- Elements that share an edge still line up, and gaps between siblings are consistent.
- Nothing overlaps, clips, or crowds the edge of the screen.
- The page has no new colors, fonts, rounded web cards, or generic gradients that the request did not call for.

## 4. Drive what the change touched

Static captures miss interaction. If the change touched any of the following, use it in the browser:

- **Animation**: pause it mid-run with `document.getAnimations().forEach(a => { a.pause(); a.currentTime = T })` and check each frame. Check that it settles where the static capture shows.
- **Form**: try an empty submit, invalid input, and the sending, success, and error states.
- **Navigation**: check refresh, browser Back and Forward, and every link.

For every change:

- Tab through the controls. Focus rings must be visible and touch targets at least 44 × 44px.
- With `prefers-reduced-motion: reduce`, motion is replaced by a fade or removed.
- Text contrast is at least 4.5:1 for body text and 3:1 for large display text.

## App notes

- **save-the-date**: also capture `/#open`, the opened invitation. It is a hash state on `/`; clicking the seal sets it. The opening animation must not replay when you return with BACK or refresh on `/#open`.

## Report

List each regression and the fix, each difference the request explains, and anything you could not verify.
