---
name: design-review
description: Review the save the date site after any visual, animation, layout, or form change. Use when the user asks to change the design, after editing UI files, or when the user says "review the design".
---

# Design review

Run this after every UI change, before telling the user the work is done. Fix what fails, then run it again. Report only failures and fixes.

## 1. Scope the change
- Re-read the user's request. Confirm only what they asked for changed.
- Diff the edited files. Revert accidental edits to layout, spacing, colors, fonts, copy, or timing that the request did not mention.

## 2. Load cleanly
- Start the dev server and open each screen: `/` (sealed envelope), `/#open` (opened invitation), and `/share-your-address`. The opened invitation is the `#open` hash on `/`, not a separate route; clicking the seal sets it.
- Each route must load with zero console errors and no failed image or font requests.
- No image may come from a `canva.site` URL. All artwork loads from the local assets folder.

## 3. Content is exact
- Couple: Peyton & Liane
- Announcement: are getting married!
- Date shows as 10.16.2027; accessible text says October 16, 2027
- Location: Trenton, Georgia
- Note: formal invitation to follow, please share your address with us
- Buttons: SHARE YOUR ADDRESS, Send address, BACK
- Closing message: We can't wait to celebrate with you!
- Do not add a countdown, music, confetti, navigation bar, registry, or RSVP questions.

## 4. Envelope and animation
Check frame by frame. Pause the Web Animations at set times (for example, `document.getAnimations().forEach(a => { a.pause(); a.currentTime = T })`) and screenshot each.
- The closed envelope, prompt, and seal are fully visible on first load without scrolling.
- The envelope is horizontal and the flap is a straight triangle.
- Click order: the seal lifts and fades, the flap flips on its top fold, the cards rise from inside the pocket, then the cards spread.
- The flap never shows mirrored text. Its underside shows the liner.
- The envelope does not move, resize, or swap artwork while it opens.
- Cards stay hidden behind the front pocket until they clear it.
- The cards end exactly in their settled positions with no jump. Compare the last animated frame with a fresh load of `/#open`.
- Double-clicking the envelope does not start a second animation.
- Ribbon and petals appear only as designed and leave no stray layer behind.
- No overlay remains after the animation. Every button stays clickable.

## 5. Navigation
- A refresh on `/#open` shows the settled cards with a brief fade and no opening sequence. The prerendered sealed envelope may paint for a moment under the stage's 300ms fade-in; that is expected, but the flap, ribbon, and flying cards must not play.
- SHARE YOUR ADDRESS goes to the form, and BACK returns without replaying the opening.
- Browser Back and Forward land on the right screen each time.

## 6. Address form
- Submitting empty shows "Please enter your name." and "Please enter your mailing address." and focuses the name field.
- An entered email like `jordan@` shows "Please enter a valid email address." Email stays optional.
- The address field accepts multiple lines and international addresses.
- Sending: the button says "Sending…", double submits are blocked, and the panel does not resize.
- Success shows "Thank you!" and Back to invitation. Error keeps the entries and allows a retry.
- State in the handoff whether submission is simulated or connected.

## 7. Responsive and accessible
- Check widths 360, 390, 430, 768, 1024, and 1440, plus a short landscape viewport and 200% zoom.
- No horizontal scroll. Names, date, and location stay readable (about 16px or larger). Form inputs are at least 16px.
- The three cards stay a collage and are never turned into a stacked list.
- Tab through every control. Focus rings are visible and touch targets are at least 44 × 44px.
- With `prefers-reduced-motion: reduce`, opening is an instant fade with no flap flip, flying cards, or hover lift.

## 8. Visual quality
- Compare each settled screen with the reference screenshots in `references/`.
- Colors stay in the cream, blush, rose, and gold palette. No new bright colors, rounded web cards, or generic gradients.
- Shadows are soft and paper-like. Remove any dark, banded, or shifting shadow.
- Text contrast is at least 4.5:1 for body text and 3:1 for large display text.

## Report
List each failed check, what you changed, and anything you could not verify (for example, motion you could only inspect frame by frame).
