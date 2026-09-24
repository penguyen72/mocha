# Save the Date Real Image Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the floral-background, wax-seal and couple-photo CSS placeholders in `apps/save-the-date` with the real Canva images.

**Architecture:** The three images are committed under `apps/save-the-date/public/images/` and rendered with `next/image` using string `src` paths and `fill`, each inside an already-positioned box. A new `FloralBackground` component is shared by both pages. The placeholder gradient tokens are deleted from `globals.css`.

**Tech Stack:** Next.js 16 (`next/image`), React 19, Tailwind v4, Vitest + Testing Library (jsdom).

Spec: `docs/superpowers/specs/2026-09-23-save-the-date-assets-design.md`.

## Global Constraints

- All commands run from `apps/save-the-date/` inside the worktree unless stated otherwise.
- Asset paths: `/images/floral-background.png`, `/images/wax-seal.png`, `/images/couple-photo.jpg`.
- Use string `src` paths, not static imports (Vite resolves image imports to plain strings, which `next/image` rejects as static data).
- Decorative images (background, seal) use `alt=""`; the photo uses `alt={PHOTO_ALT}`.
- `next/image` renders `src` as `/_next/image?url=%2Fimages%2F…`; tests decode the attribute before asserting.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

---

### Task 1: Floral background

**Files:**
- Create: `apps/save-the-date/public/images/floral-background.png`
- Create: `apps/save-the-date/src/components/floral-background.tsx`
- Test: `apps/save-the-date/src/components/floral-background.test.tsx`
- Modify: `apps/save-the-date/src/app/page.tsx`, `apps/save-the-date/src/app/share-your-address/page.tsx`
- Modify: `apps/save-the-date/src/app/globals.css` (delete `--std-bg-wash`)

**Interfaces:**
- Produces: `export function FloralBackground(): JSX.Element`. It takes no props, is absolutely positioned (`inset-0`), and expects a `relative` parent.

- [ ] **Step 1: Download the asset**

```bash
mkdir -p public/images
curl -fsSL -o public/images/floral-background.png https://mochabearsavethedate.my.canva.site/_assets/media/bad2c19288d18845ca69c05075a755c6.png
file public/images/floral-background.png   # expect: PNG image data, 1107 x 2399
```

- [ ] **Step 2: Write the failing test** (`src/components/floral-background.test.tsx`)

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FloralBackground } from "./floral-background";

describe("FloralBackground", () => {
  it("renders the floral art as a decorative image", () => {
    const { container } = render(<FloralBackground />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "");
    expect(decodeURIComponent(img!.getAttribute("src") ?? "")).toContain(
      "/images/floral-background.png",
    );
  });
});
```

- [ ] **Step 3: Run it and confirm it fails.** Run `pnpm vitest run src/components/floral-background.test.tsx`. Expected: FAIL, because the module can't be resolved.

- [ ] **Step 4: Implement** (`src/components/floral-background.tsx`)

```tsx
import Image from "next/image";

export function FloralBackground() {
  return (
    <Image
      src="/images/floral-background.png"
      alt=""
      fill
      loading="eager"
      fetchPriority="high"
      sizes="(max-width: 560px) 100vw, 560px"
      className="pointer-events-none object-cover object-center"
    />
  );
}
```

- [ ] **Step 5: Use it on both pages.** In `src/app/page.tsx` and `src/app/share-your-address/page.tsx`:
  - import `{ FloralBackground } from "@/components/floral-background"`
  - remove ` [background-image:var(--std-bg-wash)]` from the `<main>` className
  - replace the `{/* Placeholder pending the real floral background art. */}` line with `<FloralBackground />`

  `<main>` is already `relative`, so the background fills it. `InvitationStage` and `AddressSection` come after the image in the DOM, so they paint above it. If either one lacks positioning, add `relative` to its wrapper so it isn't painted underneath the image.

- [ ] **Step 6: Delete the `--std-bg-wash` token** (the whole multi-line declaration) from `src/app/globals.css`.

- [ ] **Step 7: Verify.** Run `pnpm vitest run && pnpm typecheck`. Expected: all tests PASS and no type errors.

- [ ] **Step 8: Commit** with `feat(save-the-date): render the real floral background`.

---

### Task 2: Wax seal

**Files:**
- Create: `apps/save-the-date/public/images/wax-seal.png`
- Modify: `apps/save-the-date/src/components/envelope.tsx:123-127`
- Test: `apps/save-the-date/src/components/envelope.test.tsx`
- Modify: `apps/save-the-date/src/app/globals.css` (delete `--std-seal-wax-fill`)

- [ ] **Step 1: Download the asset**

```bash
curl -fsSL -o public/images/wax-seal.png https://mochabearsavethedate.my.canva.site/_assets/media/7ce1b1e7c61a0192620dacaed4351f19.png
file public/images/wax-seal.png   # expect: PNG image data, 777 x 800
```

- [ ] **Step 2: Write the failing tests.** Add them to `envelope.test.tsx`:

```tsx
const sealSrc = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("img"))
    .map((img) => decodeURIComponent(img.getAttribute("src") ?? ""))
    .find((src) => src.includes("/images/wax-seal.png"));

it("renders the wax-seal image while closed", () => {
  const { container } = render(<Envelope phase="closed" onOpen={vi.fn()} />);
  expect(sealSrc(container)).toBeDefined();
});

it("removes the wax-seal image once open", () => {
  const { container } = render(<Envelope phase="open" onOpen={vi.fn()} />);
  expect(sealSrc(container)).toBeUndefined();
});
```

- [ ] **Step 3: Run the tests.** Run `pnpm vitest run src/components/envelope.test.tsx`. Expected: "renders the wax-seal image while closed" FAILS. The "once open" test already passes, and it guards against regressions.

- [ ] **Step 4: Implement.** In `envelope.tsx`, add `import Image from "next/image";`, then replace:

```tsx
            {/* Placeholder pending the real wax-seal export. */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-full [background:var(--std-seal-wax-fill)]"
            />
```

with:

```tsx
            <Image
              src="/images/wax-seal.png"
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 560px) 22vw, 123px"
              className="object-contain"
            />
```

- [ ] **Step 5: Delete the `--std-seal-wax-fill` token** from `globals.css`.

- [ ] **Step 6: Verify.** Run `pnpm vitest run && pnpm typecheck`. Expected: PASS.

- [ ] **Step 7: Commit** with `feat(save-the-date): render the real wax seal`.

---

### Task 3: Couple photo

**Files:**
- Create: `apps/save-the-date/public/images/couple-photo.jpg`
- Modify: `apps/save-the-date/src/components/photo-card.tsx:19-24`
- Test: `apps/save-the-date/src/components/photo-card.test.tsx`
- Modify: `apps/save-the-date/src/app/globals.css` (replace `--std-photo-placeholder` with a `--std-photo-well` color and `--color-std-photo-well` theme entry)
- Modify: `apps/save-the-date/src/components/invitation-content.ts` (the `PHOTO_ALT` doc comment)

- [ ] **Step 1: Download the asset**

```bash
curl -fsSL -o public/images/couple-photo.jpg https://mochabearsavethedate.my.canva.site/_assets/media/1162478877cca35e31c841767195395d.jpg
file public/images/couple-photo.jpg   # expect: JPEG image data, 1599x1066
```

- [ ] **Step 2: Write the failing test.** Replace the body of `photo-card.test.tsx` with:

```tsx
describe("PhotoCard", () => {
  it("renders the couple photograph with its alt text", () => {
    render(<PhotoCard animated={false} />);
    const img = screen.getByAltText(PHOTO_ALT);
    expect(decodeURIComponent(img.getAttribute("src") ?? "")).toContain("/images/couple-photo.jpg");
  });
});
```

- [ ] **Step 3: Run it and confirm it fails.** Run `pnpm vitest run src/components/photo-card.test.tsx`. Expected: FAIL, because no element has the alt text.

- [ ] **Step 4: Implement.** In `photo-card.tsx`, add `import Image from "next/image";` and `import { PHOTO_ALT } from "./invitation-content";`, then replace the placeholder comment and `div` with:

```tsx
      <div className="absolute left-[5.5%] top-[4.6%] h-[71%] w-[89%] overflow-hidden bg-std-photo-well">
        <Image
          src="/images/couple-photo.jpg"
          alt={PHOTO_ALT}
          fill
          sizes="(max-width: 560px) 37vw, 207px"
          className="object-cover"
        />
      </div>
```

- [ ] **Step 5: Update the tokens.** In `globals.css`, delete `--std-photo-placeholder`. Delete the `/* Placeholders pending the real Canva exports. See the app README. */` comment, because nothing it describes remains. Add `--std-photo-well: #dcd6c4;` next to the other flat colors near `--std-stage`, and add `--color-std-photo-well: var(--std-photo-well);` inside `@theme inline`.

- [ ] **Step 6: Update the `PHOTO_ALT` comment** in `invitation-content.ts` to read `/** Alt text for the couple photograph on the Polaroid card, verbatim from the design. */`.

- [ ] **Step 7: Verify.** Run `pnpm vitest run && pnpm typecheck && pnpm lint`. Also run `grep -rn "std-bg-wash\|std-seal-wax-fill\|std-photo-placeholder" src` and expect no matches.

- [ ] **Step 8: Commit** with `feat(save-the-date): render the real couple photograph`.

---

### Task 4: Docs and final verification

**Files:**
- Modify: `apps/save-the-date/README.md` (Known gaps)
- Modify: `docs/superpowers/reference/save-the-date-dc-source.md:50,90,94-96`

- [ ] **Step 1: README.** Delete the "**Three images are placeholders.** …" bullet, including its continuation lines, from "Known gaps".

- [ ] **Step 2: Reference doc.**
  - In the table at lines 94–96, change `Not available` to the committed path: `public/images/floral-background.png`, `public/images/couple-photo.jpg`, `public/images/wax-seal.png`.
  - After line 90, add: `The three used images were later downloaded into apps/save-the-date/public/images/ (see docs/superpowers/specs/2026-09-23-save-the-date-assets-design.md).`
  - Leave the quoted prototype notes at line 50 as written, because they are a verbatim record.

- [ ] **Step 3: Full verification.** From the repo root, run `pnpm turbo run test typecheck lint build --filter=@mocha/save-the-date`. Expected: every step succeeds.

- [ ] **Step 4: Commit** with `docs(save-the-date): record the real image assets as landed`.
