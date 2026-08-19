# Blackberry Wedding Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce the design-token system, shadcn/ui, and the shared Framer Motion/structural
primitives (`Reveal`, `SiteNav`, `Hero`, `CountdownStrip`, `SiteFooter`) that the Blackberry
wedding site port needs, and compose Blackberry's real Nav/Hero/Countdown/Footer with them.

**Architecture:** `packages/ui` gains prop-driven, content-agnostic structural components plus a
small shadcn/ui setup, styled entirely off CSS custom-property tokens. `packages/ui/src/styles.css`
keeps its existing neutral defaults unchanged (so Canton's untouched `SiteShell` placeholder
keeps working) and gains new token slots with new neutral defaults. `apps/blackberry`'s
`globals.css` overrides every shared slot with Blackberry's real palette/fonts via ordinary CSS
cascade, and defines its own local palette for values that aren't part of the shared contract.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS v4 (CSS-first config, no
`tailwind.config.js`), Framer Motion, shadcn/ui (hand-authored to match this repo's existing
`--site-*` token convention rather than shadcn's own default scaffold), Vitest, React Testing
Library.

**Spec:** `docs/superpowers/specs/2026-08-19-blackberry-wedding-foundation-design.md`
**Reference:** `docs/superpowers/reference/blackberry-wedding-dc-source.md`

## Global Constraints

- Run all `node`/`pnpm` commands under Node 24.x. If your shell's default `nvm` version differs
  (check with `node --version`), run `nvm use 24` first — this repo pins Node 24.x and `pnpm`
  under Node 22 hits a corepack signature-verification error.
- Do not modify anything under `apps/canton`. Its existing `SiteShell` usage and test must keep
  passing unmodified.
- `packages/ui/src/styles.css`'s existing token values (`--site-background`, `--site-surface`,
  `--site-foreground`, `--site-muted`, `--site-border`, `--site-font-sans`) must not change —
  only new slots are added alongside them.
- No wedding content section other than Hero/Nav/Countdown/Footer belongs in this plan
  (Schedule, Party, Travel, Stay, Explore, Details, FAQ, RSVP are later sessions' work).
- No `Tabs`, `Accordion`, or `Form` shadcn components — only `Button`, since it's the only one
  this session's components render.
- No real RSVP persistence or backend work — out of scope for this plan entirely.
- Every new shared component in `packages/ui` takes its content via props — no Blackberry copy
  or hex values inside `packages/ui` source files.
- Work happens on a feature branch, not directly on `main`.

---

## File Responsibility Map

- `packages/ui/src/styles.css`: token slots + `floatUp` keyframe (Task 1).
- `packages/ui/tsconfig.json`, `packages/ui/vitest.config.ts`: add the `@/*` path alias so
  future `shadcn add` invocations (Sessions 3–5) resolve correctly (Task 2).
- `packages/ui/vitest.setup.ts`: add a `matchMedia` polyfill (Task 2).
- `packages/ui/src/lib/utils.ts`: `cn()` helper (Task 2).
- `packages/ui/src/components/ui/button.tsx`: shadcn-style `Button`, restyled (Task 2).
- `packages/ui/src/components/reveal.tsx`: motion primitive (Task 3).
- `packages/ui/src/components/site-nav.tsx`: fixed nav shell (Task 4).
- `packages/ui/src/components/hero.tsx`: hero shell (Task 5).
- `packages/ui/src/components/countdown-strip.tsx`: countdown shell (Task 6).
- `packages/ui/src/components/site-footer.tsx`: footer shell (Task 7).
- `packages/ui/src/index.ts`: exports, updated incrementally in Tasks 2–7.
- `apps/blackberry/src/app/globals.css`: token overrides + local palette (Task 8).
- `apps/blackberry/src/app/layout.tsx`: Google Fonts links (Task 8).
- `apps/blackberry/src/assets/hero.jpeg`: real hero photo (Task 9).
- `apps/blackberry/src/app/page.tsx`: composition with real copy (Task 10).
- `AGENTS.md`: component-suite boundary note (Task 11).

---

### Task 1: Extend shared design tokens

**Files:**
- Modify: `packages/ui/src/styles.css`
- Test (non-regression, not modified): `packages/ui/src/site-shell.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: new CSS custom properties `--site-primary`, `--site-primary-foreground`,
  `--site-font-serif`, `--site-font-script`, `--site-inverted-background`,
  `--site-inverted-foreground`; new Tailwind theme tokens `--color-primary`,
  `--color-primary-foreground`, `--font-serif`, `--font-script`, `--color-inverted-background`,
  `--color-inverted-foreground`; a `floatUp` keyframe.

- [ ] **Step 1: Create the feature branch**

```bash
git checkout -b blackberry/foundation-design-system
```

- [ ] **Step 2: Confirm the baseline passes before changing anything**

Run: `nvm use 24 && pnpm --filter @mocha/ui test`
Expected: `site-shell.test.tsx` passes (1 test).

- [ ] **Step 3: Add the new token slots and keyframe**

Replace `packages/ui/src/styles.css` with:

```css
:root {
  --site-background: #f5f1ea;
  --site-surface: #fffdf9;
  --site-foreground: #26231f;
  --site-muted: #6f675d;
  --site-border: #ded6cb;
  --site-font-sans: Arial, Helvetica, sans-serif;

  --site-primary: var(--site-foreground);
  --site-primary-foreground: var(--site-surface);
  --site-font-serif: Georgia, "Times New Roman", serif;
  --site-font-script: cursive;
  --site-inverted-background: #1a1a1a;
  --site-inverted-foreground: #ffffff;
}

@theme inline {
  --color-background: var(--site-background);
  --color-surface: var(--site-surface);
  --color-foreground: var(--site-foreground);
  --color-muted: var(--site-muted);
  --color-border: var(--site-border);
  --font-sans: var(--site-font-sans);

  --color-primary: var(--site-primary);
  --color-primary-foreground: var(--site-primary-foreground);
  --font-serif: var(--site-font-serif);
  --font-script: var(--site-font-script);
  --color-inverted-background: var(--site-inverted-background);
  --color-inverted-foreground: var(--site-inverted-foreground);
}

@keyframes floatUp {
  0%,
  100% {
    transform: translate(-50%, 0);
  }
  50% {
    transform: translate(-50%, -10px);
  }
}
```

- [ ] **Step 4: Re-run the baseline test to confirm no regression**

Run: `pnpm --filter @mocha/ui test`
Expected: `site-shell.test.tsx` still passes, unchanged.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/styles.css
git commit -m "feat(ui): add primary, serif/script, and inverted design tokens"
```

---

### Task 2: Introduce shadcn/ui (Button) and Framer Motion

**Files:**
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/tsconfig.json`
- Modify: `packages/ui/vitest.config.ts`
- Modify: `packages/ui/vitest.setup.ts`
- Create: `packages/ui/components.json`
- Create: `packages/ui/src/lib/utils.ts`
- Create: `packages/ui/src/components/ui/button.tsx`
- Test: `packages/ui/src/components/ui/button.test.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: `--color-primary`/`--color-primary-foreground` tokens from Task 1.
- Produces: `cn(...inputs: ClassValue[]): string`; `Button(props: ButtonProps): JSX.Element`
  with `variant?: "default" | "outline" | "ghost" | "link"`; `buttonVariants(...)`.

- [ ] **Step 1: Install dependencies**

```bash
pnpm --filter @mocha/ui add framer-motion@latest class-variance-authority@latest clsx@latest tailwind-merge@latest @radix-ui/react-slot@latest
```

- [ ] **Step 2: Add the `@/*` path alias**

This is required so a future `pnpm dlx shadcn@latest add <component>` (Sessions 3–5) resolves
its generated `@/lib/utils` and `@/components/ui/*` imports correctly.

Replace `packages/ui/tsconfig.json` with:

```json
{
  "extends": "@mocha/typescript-config/react-library.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "vitest.config.ts", "vitest.setup.ts"],
  "exclude": ["node_modules", "coverage"]
}
```

Replace `packages/ui/vitest.config.ts` with:

```typescript
import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

- [ ] **Step 3: Add a `matchMedia` polyfill for tests**

jsdom doesn't implement `window.matchMedia`, and both Framer Motion's `useReducedMotion` (Task
3) and `SiteNav`'s responsive check (Task 4) call it. Append to `packages/ui/vitest.setup.ts`:

```typescript
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}
```

- [ ] **Step 4: Create `components.json`**

Create `packages/ui/components.json` (this makes `pnpm dlx shadcn@latest add <component>` work
from `packages/ui` for Sessions 3–5; nothing in this task depends on running the CLI):

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

- [ ] **Step 5: Create the `cn()` helper**

Create `packages/ui/src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 6: Write the failing Button test**

Create `packages/ui/src/components/ui/button.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("renders as a button by default", () => {
    render(<Button>RSVP Now</Button>);
    expect(screen.getByRole("button", { name: "RSVP Now" })).toBeInTheDocument();
  });

  it("renders as its child element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="#rsvp">RSVP Now</a>
      </Button>,
    );
    expect(screen.getByRole("link", { name: "RSVP Now" })).toHaveAttribute("href", "#rsvp");
  });
});
```

- [ ] **Step 7: Run the test and confirm it fails**

Run: `pnpm --filter @mocha/ui test`
Expected: FAIL — `./button` does not exist.

- [ ] **Step 8: Implement Button**

Create `packages/ui/src/components/ui/button.tsx`:

```tsx
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

// Only the variants this repo currently renders exist here. Add `secondary`/`destructive`
// (and their tokens in styles.css) only when a session actually needs them.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-xs font-medium uppercase tracking-[0.2em] transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90",
        outline: "border border-border bg-transparent hover:bg-background",
        ghost: "hover:bg-background",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-8 py-2.5",
        sm: "h-9 px-5",
        lg: "h-12 px-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
```

- [ ] **Step 9: Run the test and confirm it passes**

Run: `pnpm --filter @mocha/ui test`
Expected: PASS (3 tests total: the existing `SiteShell` test plus these 2).

- [ ] **Step 10: Export Button and verify lint/typecheck**

Modify `packages/ui/src/index.ts` — add:

```typescript
export { Button, buttonVariants } from "./components/ui/button";
export type { ButtonProps } from "./components/ui/button";
```

Run: `pnpm --filter @mocha/ui lint && pnpm --filter @mocha/ui typecheck`
Expected: both clean.

- [ ] **Step 11: Commit**

```bash
git add packages/ui/package.json packages/ui/tsconfig.json packages/ui/vitest.config.ts packages/ui/vitest.setup.ts packages/ui/components.json packages/ui/src/lib packages/ui/src/components/ui packages/ui/src/index.ts pnpm-lock.yaml
git commit -m "feat(ui): add shadcn-style Button and Framer Motion dependency"
```

---

### Task 3: Build the `Reveal` motion primitive

**Files:**
- Create: `packages/ui/src/components/reveal.tsx`
- Test: `packages/ui/src/components/reveal.test.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: `framer-motion` from Task 2.
- Produces: `Reveal(props: RevealProps): JSX.Element` where
  `RevealProps = { children: ReactNode; trigger?: "viewport" | "mount"; distanceY?: number; duration?: number; delay?: number }`.

- [ ] **Step 1: Write the failing tests**

Create `packages/ui/src/components/reveal.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Reveal } from "./reveal";

function setReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? matches : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as typeof window.matchMedia;
}

describe("Reveal", () => {
  beforeEach(() => {
    setReducedMotion(false);
  });

  it("renders its children with the default viewport trigger", () => {
    render(
      <Reveal>
        <p>Schedule of Events</p>
      </Reveal>,
    );
    expect(screen.getByText("Schedule of Events")).toBeInTheDocument();
  });

  it("renders its children with the mount trigger", () => {
    render(
      <Reveal trigger="mount">
        <p>Liane & Peyton</p>
      </Reveal>,
    );
    expect(screen.getByText("Liane & Peyton")).toBeInTheDocument();
  });

  it("renders already visible, with no animation, when the user prefers reduced motion", () => {
    setReducedMotion(true);
    render(
      <Reveal trigger="mount" delay={0.5}>
        <p>Reduced motion</p>
      </Reveal>,
    );
    expect(screen.getByText("Reduced motion")).toHaveStyle({ opacity: "1" });
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `pnpm --filter @mocha/ui test`
Expected: FAIL — `./reveal` does not exist.

- [ ] **Step 3: Implement Reveal**

Create `packages/ui/src/components/reveal.tsx`:

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.2, 0.8, 0.2, 1] as const;

export type RevealProps = {
  children: ReactNode;
  trigger?: "viewport" | "mount";
  distanceY?: number;
  duration?: number;
  delay?: number;
};

export function Reveal({
  children,
  trigger = "viewport",
  distanceY = 30,
  duration = 1,
  delay = 0,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const hidden = { opacity: 0, y: distanceY };
  const visible = { opacity: 1, y: 0 };

  if (prefersReducedMotion) {
    return (
      <motion.div initial={false} animate={visible}>
        {children}
      </motion.div>
    );
  }

  if (trigger === "mount") {
    return (
      <motion.div initial={hidden} animate={visible} transition={{ duration, delay, ease: EASE }}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={hidden}
      whileInView={visible}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -8% 0px" }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `pnpm --filter @mocha/ui test`
Expected: PASS (all prior tests plus these 3).

- [ ] **Step 5: Export and verify**

Modify `packages/ui/src/index.ts` — add:

```typescript
export { Reveal } from "./components/reveal";
export type { RevealProps } from "./components/reveal";
```

Run: `pnpm --filter @mocha/ui lint && pnpm --filter @mocha/ui typecheck`
Expected: both clean.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/reveal.tsx packages/ui/src/components/reveal.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add Reveal scroll/mount animation primitive"
```

---

### Task 4: Build `SiteNav`

**Files:**
- Create: `packages/ui/src/components/site-nav.tsx`
- Test: `packages/ui/src/components/site-nav.test.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: `Button` from Task 2.
- Produces: `SiteNav(props: SiteNavProps): JSX.Element` where
  `SiteNavProps = { brand: ReactNode; links: SiteNavLink[]; cta: SiteNavLink; scrollThreshold?: number; mobileBreakpoint?: number }`
  and `SiteNavLink = { label: string; href: string }`.

- [ ] **Step 1: Write the failing tests**

Create `packages/ui/src/components/site-nav.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SiteNav } from "./site-nav";

const links = [
  { label: "Schedule", href: "#schedule" },
  { label: "RSVP", href: "#rsvp" },
];
const cta = { label: "RSVP Now", href: "#rsvp" };

function mockMobileViewport() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as typeof window.matchMedia;
}

describe("SiteNav", () => {
  it("renders the supplied links and call-to-action from props", () => {
    render(<SiteNav brand={<span>L &amp; P</span>} links={links} cta={cta} />);

    expect(screen.getByRole("link", { name: "Schedule" })).toHaveAttribute("href", "#schedule");
    expect(screen.getByRole("link", { name: "RSVP Now" })).toHaveAttribute("href", "#rsvp");
  });

  it("opens and closes the mobile menu when the burger button is clicked", () => {
    mockMobileViewport();
    render(<SiteNav brand={<span>L &amp; P</span>} links={links} cta={cta} />);

    const burger = screen.getByRole("button", { name: "Menu" });
    expect(burger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(burger);
    expect(burger).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(burger);
    expect(burger).toHaveAttribute("aria-expanded", "false");
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `pnpm --filter @mocha/ui test`
Expected: FAIL — `./site-nav` does not exist.

- [ ] **Step 3: Implement SiteNav**

Create `packages/ui/src/components/site-nav.tsx`:

```tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

export type SiteNavLink = { label: string; href: string };

export type SiteNavProps = {
  brand: ReactNode;
  links: SiteNavLink[];
  cta: SiteNavLink;
  scrollThreshold?: number;
  mobileBreakpoint?: number;
};

export function SiteNav({
  brand,
  links,
  cta,
  scrollThreshold = 0.7,
  mobileBreakpoint = 860,
}: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * scrollThreshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollThreshold]);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`);
    const onChange = () => setIsMobile(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [mobileBreakpoint]);

  const closeMobile = () => setMobileOpen(false);
  const ctaClassName = scrolled
    ? "bg-primary text-primary-foreground"
    : "bg-white text-foreground hover:bg-white/90";

  return (
    <nav
      className={
        "fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 transition-colors duration-300 sm:px-12 " +
        (scrolled
          ? "bg-background/94 text-foreground shadow-md backdrop-blur-md"
          : "bg-transparent text-primary-foreground")
      }
    >
      <a href="#home" className="font-serif text-2xl tracking-widest">
        {brand}
      </a>

      {!isMobile && (
        <div className="flex items-center gap-8">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm uppercase tracking-widest">
              {link.label}
            </a>
          ))}
          <Button asChild size="sm" className={ctaClassName}>
            <a href={cta.href}>{cta.label}</a>
          </Button>
        </div>
      )}

      {isMobile && (
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className="flex flex-col gap-1.5 p-1.5"
        >
          <span className="block h-0.5 w-6 bg-current" />
          <span className="block h-0.5 w-6 bg-current" />
          <span className="block h-0.5 w-6 bg-current" />
        </button>
      )}

      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="absolute inset-x-0 top-full flex flex-col gap-4 overflow-hidden bg-background px-8 py-6 text-foreground shadow-lg"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="text-sm uppercase tracking-widest"
              >
                {link.label}
              </a>
            ))}
            <a
              href={cta.href}
              onClick={closeMobile}
              className="text-sm uppercase tracking-widest text-primary"
            >
              {cta.label}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `pnpm --filter @mocha/ui test`
Expected: PASS (all prior tests plus these 2).

- [ ] **Step 5: Export and verify**

Modify `packages/ui/src/index.ts` — add:

```typescript
export { SiteNav } from "./components/site-nav";
export type { SiteNavProps, SiteNavLink } from "./components/site-nav";
```

Run: `pnpm --filter @mocha/ui lint && pnpm --filter @mocha/ui typecheck`
Expected: both clean.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/site-nav.tsx packages/ui/src/components/site-nav.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add SiteNav with scroll crossfade and mobile menu"
```

---

### Task 5: Build `Hero`

**Files:**
- Modify: `packages/ui/package.json`
- Create: `packages/ui/src/components/hero.tsx`
- Test: `packages/ui/src/components/hero.test.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: `Reveal` from Task 3, `Button` from Task 2, `next/image`.
- Produces: `Hero(props: HeroProps): JSX.Element` where
  `HeroProps = { eyebrow: ReactNode; heading: ReactNode; dateLabel: ReactNode; locationLabel: string; cta: { label: string; href: string }; backgroundImage: { src: StaticImageData; alt: string }; scrollCueLabel?: string }`.

- [ ] **Step 1: Add `next` as a dependency of `packages/ui`**

`Hero` is the first `packages/ui` component to use `next/image`. Since every current and
planned consumer of `packages/ui` is a Next.js app in this monorepo, add `next` the same way
`react`/`react-dom` are already declared — as a peer dependency, plus a pinned dev dependency
for local typecheck/build/test.

Modify `packages/ui/package.json` — add to `peerDependencies`:

```json
"next": "^16.0.0"
```

Then run:

```bash
pnpm --filter @mocha/ui add -D next@16.3.1
```

- [ ] **Step 2: Write the failing test**

Create `packages/ui/src/components/hero.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Hero } from "./hero";

describe("Hero", () => {
  it("renders the supplied copy, cta, and background image alt text", () => {
    render(
      <Hero
        eyebrow="together with their families"
        heading="Liane & Peyton"
        dateLabel="Oct 1–3, 2027"
        locationLabel="The Villa at Blackberry Ridge · Trenton, Georgia"
        cta={{ label: "RSVP Now", href: "#rsvp" }}
        backgroundImage={{
          src: { src: "/hero.jpg", height: 1200, width: 1600 },
          alt: "Liane and Peyton",
        }}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Liane & Peyton" })).toBeInTheDocument();
    expect(
      screen.getByText("The Villa at Blackberry Ridge · Trenton, Georgia"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "RSVP Now" })).toHaveAttribute("href", "#rsvp");
    expect(screen.getByAltText("Liane and Peyton")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the test and confirm it fails**

Run: `pnpm --filter @mocha/ui test`
Expected: FAIL — `./hero` does not exist.

- [ ] **Step 4: Implement Hero**

Create `packages/ui/src/components/hero.tsx`:

```tsx
import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";

export type HeroProps = {
  eyebrow: ReactNode;
  heading: ReactNode;
  dateLabel: ReactNode;
  locationLabel: string;
  cta: { label: string; href: string };
  backgroundImage: { src: StaticImageData; alt: string };
  scrollCueLabel?: string;
};

const STAGGER_BASE_MS = 250;
const STAGGER_STEP_MS = 220;
const delayFor = (index: number) => (STAGGER_BASE_MS + index * STAGGER_STEP_MS) / 1000;
const HERO_MOTION = { trigger: "mount" as const, duration: 1.1, distanceY: 24 };

export function Hero({
  eyebrow,
  heading,
  dateLabel,
  locationLabel,
  cta,
  backgroundImage,
  scrollCueLabel = "Scroll",
}: HeroProps) {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden py-24"
    >
      <Image
        src={backgroundImage.src}
        alt={backgroundImage.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(rgba(74,59,53,.55) 0%, rgba(74,59,53,.34) 32%, rgba(74,59,53,.4) 66%, rgba(74,59,53,.68) 100%)",
        }}
      />

      <div className="relative z-10 px-6 text-center text-white">
        <Reveal {...HERO_MOTION} delay={delayFor(0)}>
          <p className="font-script text-4xl">{eyebrow}</p>
        </Reveal>
        <Reveal {...HERO_MOTION} delay={delayFor(1)}>
          <h1 className="my-2 font-serif text-7xl leading-none sm:text-8xl">{heading}</h1>
        </Reveal>
        <Reveal {...HERO_MOTION} delay={delayFor(2)}>
          <div className="mx-auto mt-6 flex max-w-xl items-center gap-5">
            <span className="h-px flex-1 bg-white/55" />
            <span className="whitespace-nowrap text-sm uppercase tracking-[0.32em]">
              {dateLabel}
            </span>
            <span className="h-px flex-1 bg-white/55" />
          </div>
        </Reveal>
        <Reveal {...HERO_MOTION} delay={delayFor(3)}>
          <p className="mt-4 text-sm uppercase tracking-[0.18em]">{locationLabel}</p>
        </Reveal>
        <Reveal {...HERO_MOTION} delay={delayFor(4)}>
          <Button asChild size="lg" className="mt-10 bg-white text-foreground hover:bg-white/90">
            <a href={cta.href}>{cta.label}</a>
          </Button>
        </Reveal>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 animate-[floatUp_3s_ease-in-out_infinite] text-center text-white">
        <span className="mb-2 block text-xs uppercase tracking-[0.24em] opacity-85">
          {scrollCueLabel}
        </span>
        <span className="mx-auto block h-10 w-px bg-white/70" />
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run the test and confirm it passes**

Run: `pnpm --filter @mocha/ui test`
Expected: PASS.

- [ ] **Step 6: Export and verify**

Modify `packages/ui/src/index.ts` — add:

```typescript
export { Hero } from "./components/hero";
export type { HeroProps } from "./components/hero";
```

Run: `pnpm --filter @mocha/ui lint && pnpm --filter @mocha/ui typecheck`
Expected: both clean.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/package.json packages/ui/src/components/hero.tsx packages/ui/src/components/hero.test.tsx packages/ui/src/index.ts pnpm-lock.yaml
git commit -m "feat(ui): add Hero section with staggered entrance"
```

---

### Task 6: Build `CountdownStrip`

**Files:**
- Create: `packages/ui/src/components/countdown-strip.tsx`
- Test: `packages/ui/src/components/countdown-strip.test.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: nothing beyond React.
- Produces: `CountdownStrip(props: CountdownStripProps): JSX.Element` where
  `CountdownStripProps = { tagline: ReactNode; targetDate: string; labels?: CountdownStripLabels }`
  and `CountdownStripLabels = { days: string; hours: string; minutes: string; seconds: string }`.

- [ ] **Step 1: Write the failing tests**

Create `packages/ui/src/components/countdown-strip.test.tsx`:

```tsx
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CountdownStrip } from "./countdown-strip";

describe("CountdownStrip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-10-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders zero-padded units and ticks down over time", () => {
    const target = new Date("2027-10-01T00:00:00.000Z");
    target.setUTCDate(target.getUTCDate() + 1);
    target.setUTCHours(2, 3, 5, 0);

    render(<CountdownStrip tagline="We can't wait to celebrate with you" targetDate={target.toISOString()} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("05")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("04")).toBeInTheDocument();
  });

  it("floors every unit at zero once the target has passed", () => {
    render(<CountdownStrip tagline="We can't wait to celebrate with you" targetDate="2020-01-01T00:00:00.000Z" />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getAllByText("00")).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `pnpm --filter @mocha/ui test`
Expected: FAIL — `./countdown-strip` does not exist.

- [ ] **Step 3: Implement CountdownStrip**

Create `packages/ui/src/components/countdown-strip.tsx`:

```tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";

export type CountdownStripLabels = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

export type CountdownStripProps = {
  tagline: ReactNode;
  targetDate: string;
  labels?: CountdownStripLabels;
};

const DEFAULT_LABELS: CountdownStripLabels = {
  days: "Days",
  hours: "Hours",
  minutes: "Minutes",
  seconds: "Seconds",
};

type CountdownValue = { days: string; hours: string; minutes: string; seconds: string };

const INITIAL: CountdownValue = { days: "00", hours: "00", minutes: "00", seconds: "00" };

function computeCountdown(targetDate: string): CountdownValue {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  const pad = (value: number) => String(value).padStart(2, "0");
  return {
    days: String(Math.floor(diff / 86_400_000)),
    hours: pad(Math.floor((diff % 86_400_000) / 3_600_000)),
    minutes: pad(Math.floor((diff % 3_600_000) / 60_000)),
    seconds: pad(Math.floor((diff % 60_000) / 1_000)),
  };
}

export function CountdownStrip({
  tagline,
  targetDate,
  labels = DEFAULT_LABELS,
}: CountdownStripProps) {
  const [value, setValue] = useState<CountdownValue>(INITIAL);

  useEffect(() => {
    setValue(computeCountdown(targetDate));
    const timer = setInterval(() => {
      setValue(computeCountdown(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const stats: [string, string][] = [
    [value.days, labels.days],
    [value.hours, labels.hours],
    [value.minutes, labels.minutes],
    [value.seconds, labels.seconds],
  ];

  return (
    <section className="bg-primary px-6 py-14 text-center text-primary-foreground">
      <p className="mb-6 font-serif text-2xl italic">{tagline}</p>
      <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
        {stats.map(([digits, label]) => (
          <div key={label}>
            <div className="font-serif text-5xl sm:text-6xl">{digits}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.2em] opacity-85">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `pnpm --filter @mocha/ui test`
Expected: PASS.

- [ ] **Step 5: Export and verify**

Modify `packages/ui/src/index.ts` — add:

```typescript
export { CountdownStrip } from "./components/countdown-strip";
export type { CountdownStripProps, CountdownStripLabels } from "./components/countdown-strip";
```

Run: `pnpm --filter @mocha/ui lint && pnpm --filter @mocha/ui typecheck`
Expected: both clean.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/countdown-strip.tsx packages/ui/src/components/countdown-strip.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add CountdownStrip with client-only ticking"
```

---

### Task 7: Build `SiteFooter`

**Files:**
- Create: `packages/ui/src/components/site-footer.tsx`
- Test: `packages/ui/src/components/site-footer.test.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: nothing beyond React.
- Produces: `SiteFooter(props: SiteFooterProps): JSX.Element` where
  `SiteFooterProps = { heading: ReactNode; subline: string; tagline: string }`.

- [ ] **Step 1: Write the failing test**

Create `packages/ui/src/components/site-footer.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("renders the supplied heading, subline, and tagline", () => {
    render(
      <SiteFooter
        heading="Liane & Peyton"
        subline="October 1–3, 2027 · Trenton, Georgia"
        tagline="Made with love for our favorite people."
      />,
    );

    expect(screen.getByText("Liane & Peyton")).toBeInTheDocument();
    expect(screen.getByText("October 1–3, 2027 · Trenton, Georgia")).toBeInTheDocument();
    expect(screen.getByText("Made with love for our favorite people.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm --filter @mocha/ui test`
Expected: FAIL — `./site-footer` does not exist.

- [ ] **Step 3: Implement SiteFooter**

Create `packages/ui/src/components/site-footer.tsx`:

```tsx
import type { ReactNode } from "react";

export type SiteFooterProps = {
  heading: ReactNode;
  subline: string;
  tagline: string;
};

export function SiteFooter({ heading, subline, tagline }: SiteFooterProps) {
  return (
    <footer className="bg-inverted-background px-6 py-20 text-center text-inverted-foreground">
      <p className="font-serif text-5xl sm:text-6xl">{heading}</p>
      <p className="mt-5 text-xs uppercase tracking-[0.28em] opacity-60">{subline}</p>
      <p className="mt-7 text-xs tracking-[0.1em] opacity-40">{tagline}</p>
    </footer>
  );
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `pnpm --filter @mocha/ui test`
Expected: PASS.

- [ ] **Step 5: Export and verify**

Modify `packages/ui/src/index.ts` — add:

```typescript
export { SiteFooter } from "./components/site-footer";
export type { SiteFooterProps } from "./components/site-footer";
```

Run: `pnpm --filter @mocha/ui lint && pnpm --filter @mocha/ui typecheck && pnpm --filter @mocha/ui test`
Expected: all clean; full `@mocha/ui` suite passes (12 tests: 1 `SiteShell` + 2 `Button` + 3
`Reveal` + 2 `SiteNav` + 1 `Hero` + 2 `CountdownStrip` + 1 `SiteFooter`).

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/site-footer.tsx packages/ui/src/components/site-footer.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add SiteFooter"
```

---

### Task 8: Blackberry token overrides and fonts

**Files:**
- Modify: `apps/blackberry/src/app/globals.css`
- Modify: `apps/blackberry/src/app/layout.tsx`

**Interfaces:**
- Consumes: shared token slots from Task 1.
- Produces: Blackberry's real palette applied; Google Fonts loaded.

- [ ] **Step 1: Override shared tokens and add the local palette**

Replace `apps/blackberry/src/app/globals.css` with:

```css
@import "tailwindcss";
@import "@mocha/ui/styles.css";
@source "../../../../packages/ui/src";

:root {
  --site-background: #fbf6f1;
  --site-surface: #fbf6f1;
  --site-foreground: #4a3b35;
  --site-muted: #7a675e;
  --site-border: #e7d6c9;
  --site-primary: #d6866b;
  --site-primary-foreground: #ffffff;
  --site-font-sans: "Jost", sans-serif;
  --site-font-serif: "Cormorant Garamond", serif;
  --site-font-script: "Pinyon Script", cursive;
  --site-inverted-background: #000000;
  --site-inverted-foreground: #ffffff;

  /* Blackberry's local editorial palette — not part of the shared @mocha/ui token contract. */
  --bb-clay: #b2795e;
  --bb-terracotta: #d6866b;
  --bb-peach: #f2c7b4;
  --bb-blush: #f4e9e0;
  --bb-mauve: #c3a6a8;
  --bb-line: #e7d6c9;
  --bb-ink-black: #000000;
}

* {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  background: var(--site-background);
}

body {
  margin: 0;
  font-family: var(--site-font-sans);
  font-weight: 300;
}
```

- [ ] **Step 2: Add the Google Fonts links**

Replace `apps/blackberry/src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Blackberry — Liane & Peyton",
  description: "The friends wedding website for Liane and Peyton.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@300;400;500&family=Pinyon+Script&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Confirm the app still builds**

Run: `pnpm --filter @mocha/blackberry typecheck`
Expected: clean (the placeholder `page.tsx` still imports `SiteShell`, unaffected by this task).

- [ ] **Step 4: Commit**

```bash
git add apps/blackberry/src/app/globals.css apps/blackberry/src/app/layout.tsx
git commit -m "feat(blackberry): override shared tokens with the wedding palette and fonts"
```

---

### Task 9: Bring in the real hero photo

**Files:**
- Create: `apps/blackberry/src/assets/hero.jpeg`

**Interfaces:**
- Consumes: the Claude Design project via the `claude_design` MCP tool.
- Produces: a static image asset for Task 10's `page.tsx` to import.

- [ ] **Step 1: Fetch the asset**

Using the `claude_design` MCP tool (`get_file`, project ID `b65c3d68-cdf2-4e73-bc96-fcbafc18d737`,
path `assets/hero.jpeg`), save its content to `apps/blackberry/src/assets/hero.jpeg`. If the MCP
tool isn't authenticated in this session, run `/design-login` first, or open
`https://claude.ai/design/p/b65c3d68-cdf2-4e73-bc96-fcbafc18d737?file=Wedding.dc.html` directly
and export the image manually to the same path.

- [ ] **Step 2: Confirm the file is a valid image**

Run: `file apps/blackberry/src/assets/hero.jpeg`
Expected: reports a JPEG image (not an HTML error page or empty file).

- [ ] **Step 3: Commit**

```bash
git add apps/blackberry/src/assets/hero.jpeg
git commit -m "feat(blackberry): add real engagement photo for the hero background"
```

---

### Task 10: Compose Blackberry's page

**Files:**
- Modify: `apps/blackberry/src/app/page.tsx`

**Interfaces:**
- Consumes: `SiteNav`, `Hero`, `CountdownStrip`, `SiteFooter` from `@mocha/ui`; the hero photo
  from Task 9.
- Produces: Blackberry's real landing page, with a clearly marked slot for Sessions 2–5.

- [ ] **Step 1: Replace the placeholder page**

Replace `apps/blackberry/src/app/page.tsx` with:

```tsx
import { CountdownStrip, Hero, SiteFooter, SiteNav } from "@mocha/ui";

import heroPhoto from "@/assets/hero.jpeg";

const NAV_LINKS = [
  { label: "Schedule", href: "#schedule" },
  { label: "Travel", href: "#travel" },
  { label: "Stay", href: "#stay" },
  { label: "Explore", href: "#explore" },
  { label: "Details", href: "#details" },
  { label: "FAQ", href: "#faq" },
];

const RSVP_CTA = { label: "RSVP", href: "#rsvp" };

export default function Home() {
  return (
    <>
      <SiteNav
        brand={
          <>
            L <span className="font-script text-2xl">&amp;</span> P
          </>
        }
        links={NAV_LINKS}
        cta={RSVP_CTA}
      />

      <Hero
        eyebrow="together with their families"
        heading={
          <>
            Liane
            <span className="block font-script text-5xl font-normal sm:text-6xl">&amp;</span>
            Peyton
          </>
        }
        dateLabel="Oct 1–3, 2027"
        locationLabel="The Villa at Blackberry Ridge · Trenton, Georgia"
        cta={{ label: "RSVP Now", href: "#rsvp" }}
        backgroundImage={{ src: heroPhoto, alt: "Liane and Peyton" }}
      />

      <CountdownStrip
        tagline="We can't wait to celebrate with you"
        targetDate="2027-10-02T16:00:00-04:00"
      />

      {/*
        Sessions 2–5 add their sections here, in this order:
        Schedule of Events, Wedding Party, Travel & Directions, Accommodations (Stay),
        Explore, Details, FAQ, RSVP.
      */}

      <SiteFooter
        heading={
          <>
            Liane <span className="font-script font-normal">&amp;</span> Peyton
          </>
        }
        subline="October 1–3, 2027 · Trenton, Georgia"
        tagline="Made with love for our favorite people."
      />
    </>
  );
}
```

- [ ] **Step 2: Confirm the app builds and typechecks**

Run: `pnpm --filter @mocha/blackberry typecheck && pnpm --filter @mocha/blackberry build`
Expected: both succeed.

- [ ] **Step 3: Manually verify in the browser**

Run: `pnpm --filter @mocha/blackberry dev`, open `http://localhost:3001`. Confirm: the hero
photo renders full-bleed with the gradient overlay; the five hero elements cascade in on load;
the nav is transparent with white text over the hero and crossfades to a cream, blurred
background with dark text once scrolled past ~70% of the viewport height; the countdown ticks;
the footer renders in black. Stop the dev server (Ctrl-C) when done.

- [ ] **Step 4: Commit**

```bash
git add apps/blackberry/src/app/page.tsx
git commit -m "feat(blackberry): compose real Nav, Hero, Countdown, and Footer"
```

---

### Task 11: Record the shadcn/ui decision in AGENTS.md

**Files:**
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: nothing.
- Produces: an updated boundary note reflecting that shadcn/ui is approved and where it lives.

- [ ] **Step 1: Update the boundary note**

In `AGENTS.md`, replace:

```markdown
- Do not introduce runtime microfrontend machinery, storage, authentication, analytics, a CMS, or a component suite without an approved design.
```

with:

```markdown
- Do not introduce runtime microfrontend machinery, storage, authentication, analytics, or a CMS without an approved design.
- shadcn/ui is approved and lives in `packages/ui` (see `docs/superpowers/specs/2026-08-19-blackberry-wedding-foundation-design.md`), hand-authored to this repo's `--site-*` token convention rather than shadcn's own default scaffold. Add components there with `pnpm dlx shadcn@latest add <component>` only when an approved design actually needs them — don't pre-install unused components.
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: record the shadcn/ui decision in AGENTS.md"
```

---

### Task 12: Full repository verification

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Run the complete verification suite from the repository root**

```bash
nvm use 24
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: all four commands pass, including `@mocha/canton`'s unmodified build and
`@mocha/ui`'s full test suite (12 tests).

- [ ] **Step 2: Confirm a clean working tree**

Run: `git status --short`
Expected: empty — every task committed its own changes.

- [ ] **Step 3: Review the branch's full diff against `main`**

Run: `git log main..HEAD --oneline` and `git diff main...HEAD --stat`
Expected: one commit per task above, touching only the files listed in the File Responsibility
Map — nothing under `apps/canton`.
