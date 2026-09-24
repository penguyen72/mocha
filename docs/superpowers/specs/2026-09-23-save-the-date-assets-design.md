# Save the Date — Real Image Assets

## Goal

Replace the three CSS-gradient placeholders in `apps/save-the-date` (floral background, couple
photograph, wax seal) with the real Canva images, and remove the corresponding "known gap".

## Source files

Downloaded from `https://mochabearsavethedate.my.canva.site/_assets/media/` (verified: all return
HTTP 200 with the expected content type).

| Canva file | Committed as | Dimensions | Size |
| --- | --- | --- | --- |
| `bad2c19288d18845ca69c05075a755c6.png` | `public/images/floral-background.png` | 1107×2399 | 1.5 MB |
| `1162478877cca35e31c841767195395d.jpg` | `public/images/couple-photo.jpg` | 1599×1066 | 197 KB |
| `7ce1b1e7c61a0192620dacaed4351f19.png` | `public/images/wax-seal.png` | 777×800 | 1.3 MB |

Paths are relative to `apps/save-the-date/`. `public/` does not exist yet and is created here.

## Rendering

All three use `next/image` so Next.js serves resized, re-encoded variants instead of the raw PNGs.

- **Floral background** — a new `FloralBackground` component (`src/components/floral-background.tsx`)
  rendering `<Image fill priority alt="" className="object-cover object-center" />` absolutely
  positioned behind page content. Both `src/app/page.tsx` and `src/app/share-your-address/page.tsx`
  render it in place of the "Placeholder pending the real floral background art" comment, and drop
  the `--std-bg-wash` gradient. The `bg-std-stage` (`#FCF5F2`) color stays underneath, matching the
  design source (`background: #FCF5F2 url(<floral>) center/cover no-repeat`). The `--std-bg-wash`
  token is removed from `globals.css` once unused.
- **Wax seal** — in `envelope.tsx`, the gradient `div` is replaced by
  `<Image fill priority alt="" />` inside the existing `aspect-[777/800]` box. The `P&L` monogram
  stays layered on top. The image is decorative; the open button carries the accessible label. The
  `--std-seal-wax-fill` token is removed once unused.
- **Couple photo** — in `photo-card.tsx`, the gradient `div` is replaced by a positioned wrapper at
  the same `left-[5.5%] top-[4.6%] h-[71%] w-[89%]` box, filled with a new `--std-photo-well:
  #dcd6c4` token (the design's photo-well color), holding
  `<Image fill alt={PHOTO_ALT} className="object-cover" />`. Not `priority`: it is only visible after
  the envelope opens. The `--std-photo-placeholder` token is removed.

Each `fill` image gets a `sizes` hint matching its rendered width within the 560px-max stage
(background `min(100vw, 560px)`, seal ~22% of that, photo ~37% of that).

## Tests

- `photo-card.test.tsx`: flip the existing assertion — the image with alt `PHOTO_ALT` is present.
- `envelope.test.tsx`: the seal image renders while closed/opening and is gone once open (it lives
  in the seal layer, so it follows the existing monogram assertions).
- New `floral-background.test.tsx`: renders a decorative image pointing at the floral background.

## Docs

- `apps/save-the-date/README.md`: remove the "Three images are placeholders" known gap.
- `docs/superpowers/reference/save-the-date-dc-source.md`: mark the three assets as downloaded,
  naming their committed paths.

## Out of scope

The champagne-glass illustration (no Canva export exists) and the unused closed/open envelope
images.
