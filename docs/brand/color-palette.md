# Wedding color palette

Liane and Peyton's wedding palette: five soft whites and blush pinks, specified as Pantone colors.

| # | Pantone | Name | Approx. hex |
| - | ------- | ---- | ----------- |
| 1 | P 75-1 C | — | `#F5F4F4` |
| 2 | P 75-9 C | — | `#F1EBED` |
| 3 | 20-0103 TPM | Intimate Pink | `#EFE0E3` |
| 4 | 11-1400 TCX | Raindrops on Roses | `#E6DADC` |
| 5 | 11-0607 TCX | Sugar Swizzle | `#F0EEEB` |

## About the hex values

The Pantone codes are the source of truth. The hex values were sampled from a screenshot of the
swatches, so they are only approximations of the printed colors. Use the hex values in code, and
prefer official Pantone conversions when they're available.

## Usage

Blackberry uses these colors as its base, blending in Save the Date's warmer blush card,
date card, and ribbon pinks for a more pink-forward theme. Deep rose accents and dark text
keep content and controls readable. Its values and `--site-*` overrides live in
`apps/blackberry/src/app/globals.css`. Each app owns its theme; adopting the palette in another
app goes through the Superpowers design workflow in `AGENTS.md`.

Every color here is very light, so none of them gives readable contrast for body text on
another. Use them for backgrounds, surfaces, and borders, and pair them with a darker foreground
and accent.
