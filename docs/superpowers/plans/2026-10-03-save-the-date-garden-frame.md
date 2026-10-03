# Save the Date garden frame — implementation plan

Design: `docs/superpowers/specs/2026-10-03-save-the-date-garden-frame-design.md`.
All work is in `apps/save-the-date`.

1. **Floral frame (TDD).** Test that `FloralBackground` renders the artwork as two decorative
   halves, top and bottom. Then render each half as a fading box pinned to its edge, holding the
   image at the stage's width, and add the bloom-in animation.
2. **Petals at depth (TDD).** Test that `PetalScatter` renders far, mid and near layers, every
   petal still falling, and that `InvitationStage` still saves the petals for the opening.
   Then group the petals by depth.
3. **Header (TDD).** Test that the header renders a decorative sprig. Then move the header, make
   the eyebrow rose and add the sprig.
4. **Envelope and prompt.** Retune the envelope paper tokens and shadow, add the flap's white
   edge, seat the postmark, and add the seal's shadow, shimmer and hover swell. Add hairlines to the
   prompt.
5. **Candlelight and paper texture** as decorative layers in the stage and the page.
6. **Intro timing and reduced motion.** Add the new animation tokens and their `none`
   counterparts.
7. **Verify.** Run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` from the repo
   root, then check the page in a browser at phone and desktop sizes, sealed and opened.
