# Blackberry Wedding Explore / Details / FAQ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the Explore, Details, and FAQ sections of the Blackberry wedding site source design into `apps/blackberry`, matching the source exactly, and compose them into the page.

**Architecture:** Two new shadcn primitives (`Tabs`, `Accordion`) restyled to the site palette plus a new generic `TabSwitch` wrapper go into `packages/ui` (content-agnostic, tested). Three Blackberry-specific Server Components — `Explore`, `Details`, `Faq` — each with a sibling `*-content.ts` file, go flat into `apps/blackberry/src/components/` (matching Session 2/3's established convention) and compose those primitives with real copy.

**Tech Stack:** Next.js 16 (App Router, Server Components), React 19, Tailwind CSS v4 (CSS-first `@theme`), shadcn/ui (`new-york` style, Radix primitives), Framer Motion (via the existing `Reveal` primitive), Vitest + Testing Library.

## Global Constraints

- Use pnpm only; never add npm or Yarn lockfiles.
- Node 24.x.
- Default to Server Components; the only client boundaries in this plan are `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`, `Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent`, and the `TabSwitch` primitive built on top of `Tabs` — every section component itself stays a Server Component.
- `packages/ui`'s `@/*` path alias was removed in Session 1 (see `packages/ui/tsconfig.json`, `compilerOptions: {}`). The shadcn CLI still emits `@/`-prefixed imports (per `components.json`'s `aliases`) — every generated file's imports MUST be rewritten to relative paths before it will even compile, not just as a style preference.
- Add shadcn components only when needed — this plan adds exactly `tabs` and `accordion`, nothing else.
- Always run `pnpm add`/`pnpm dlx shadcn add` scoped with `pnpm --filter @mocha/ui` (or `cd packages/ui` first) — never bare `pnpm add` from the repo root, which adds the dependency to the root `package.json` instead of the package that needs it.
- The shadcn CLI's default template imports from the combined `radix-ui` package; this repo's convention (see `Button`, and Task 1/2's given file content) imports each primitive from its own `@radix-ui/react-*` package instead, matching how `Button` already imports `@radix-ui/react-slot` directly. Don't let `radix-ui` end up as a real dependency — if the CLI adds it, remove it after replacing the generated file with the given restyled version.
- Radix's `Tabs.Trigger` activates on `onMouseDown`/`onFocus`, not `onClick` — tests that click a `Tabs`/`TabSwitch` trigger must use `@testing-library/user-event`, not `fireEvent.click` (see Task 1). Radix's `Accordion.Trigger` uses plain `onClick` (verified by reading `@radix-ui/react-collapsible`'s source) — its test keeps `fireEvent.click`, no change needed.
- Colocate each section's content data in a sibling `*-content.ts` file next to its flat `*.tsx` component (not inlined in the component, not a shared `content.ts`) — matches Session 2's (`schedule-content.ts`/`schedule.tsx`) and Session 3's convention, confirmed via cross-session coordination.
- Keep Blackberry-specific copy and composition in `apps/blackberry`; keep `packages/ui` components prop-driven with no Blackberry copy inside their source.
- Use the reference doc's copy verbatim: `docs/superpowers/reference/blackberry-wedding-dc-source.md`, §8 (Explore), §9 (Details), §10 (FAQ).
- Registry links use placeholder `href="#rsvp"` (approved decision — no real registry URLs exist yet). Explore cards use a styled CSS gradient placeholder block instead of a real photo (approved decision — no real photo assets exist for these activities).
- No new Vitest infrastructure in `apps/blackberry` (approved decision — it has no `test` script today and none of this plan's app-level components have behavior of their own beyond already-tested `packages/ui` primitives). New tests only apply to the three new `packages/ui` primitives.
- Before the work is considered done, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` must all pass from the repository root.

## File Responsibility Map

| File | Responsibility |
| --- | --- |
| `packages/ui/src/components/ui/tabs.tsx` | Restyled shadcn `Tabs` primitive (pill segmented control, instant color swap) |
| `packages/ui/src/components/ui/tabs.test.tsx` | `Tabs` behavior test |
| `packages/ui/src/components/ui/accordion.tsx` | Restyled shadcn `Accordion` primitive (single-open, rotating "+") |
| `packages/ui/src/components/ui/accordion.test.tsx` | `Accordion` behavior test |
| `packages/ui/src/components/tab-switch.tsx` | Generic reusable tab-switch wrapper — used by Explore now, documented for Session 3's Stay tabs to reuse |
| `packages/ui/src/components/tab-switch.test.tsx` | `TabSwitch` behavior test |
| `packages/ui/src/styles.css` | New `accordion-down`/`accordion-up` keyframes and `--animate-*` theme tokens |
| `packages/ui/src/index.ts` | Export the three new primitives |
| `apps/blackberry/src/components/explore-content.ts` | Chattanooga/Atlanta activity data (typed consts) |
| `apps/blackberry/src/components/explore.tsx` | Explore section (`#explore`) |
| `apps/blackberry/src/components/details-content.ts` | Dress-code/registry data (typed consts) |
| `apps/blackberry/src/components/details.tsx` | Details section (`#details`) |
| `apps/blackberry/src/components/faq-content.ts` | FAQ Q&A data (typed consts) |
| `apps/blackberry/src/components/faq.tsx` | FAQ section (`#faq`) |
| `apps/blackberry/src/app/page.tsx` | Compose the three sections between the countdown strip and footer |

---

### Task 1: Add the restyled `Tabs` primitive

**Files:**
- Modify: `packages/ui/package.json` (via CLI)
- Modify: `pnpm-lock.yaml` (via CLI)
- Create: `packages/ui/src/components/ui/tabs.tsx`
- Test: `packages/ui/src/components/ui/tabs.test.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: `cn()` from `packages/ui/src/lib/utils.ts` (existing); `--color-primary`, `--color-primary-foreground`, `--color-border`, `--color-foreground` theme tokens (existing, Session 1).
- Produces: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` — thin restyled wrappers around `@radix-ui/react-tabs`'s `Root`/`List`/`Trigger`/`Content`, each accepting that primitive's own props (`value`/`defaultValue`/`onValueChange` on `Tabs`, `value` on `TabsTrigger`/`TabsContent`) plus an optional `className`.

- [ ] **Step 1: Add `@testing-library/user-event`**

Radix's `Tabs.Trigger` activates on `onMouseDown`/`onFocus`, not `onClick` (confirmed by reading
`@radix-ui/react-tabs`'s source) — plain `fireEvent.click()` does not dispatch a `mousedown` or
move focus, so it never triggers Radix's handler in jsdom. `@testing-library/user-event`
simulates the full realistic pointer/focus sequence and is the standard fix for testing Radix
primitives; it isn't a dependency anywhere in the monorepo yet.

```bash
pnpm --filter @mocha/ui add -D @testing-library/user-event@latest
```

- [ ] **Step 2: Write the failing test**

Create `packages/ui/src/components/ui/tabs.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

describe("Tabs", () => {
  it("shows only the active tab's content, switching on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Tab A</TabsTrigger>
          <TabsTrigger value="b">Tab B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Content A")).toBeInTheDocument();
    expect(screen.queryByText("Content B")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Tab B" }));

    expect(screen.getByText("Content B")).toBeInTheDocument();
    expect(screen.queryByText("Content A")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the test and confirm it fails**

Run: `pnpm --filter @mocha/ui exec vitest run src/components/ui/tabs.test.tsx`
Expected: FAIL — `./tabs` does not exist.

- [ ] **Step 4: Scaffold via the shadcn CLI**

```bash
cd packages/ui && pnpm dlx shadcn@latest add tabs --yes
```

This installs `@radix-ui/react-tabs` and writes an initial `packages/ui/src/components/ui/tabs.tsx`
(and, since the CLI can't resolve this package's removed `@/*` alias, may also write a stray
literal `packages/ui/@/components/ui/tabs.tsx` — delete that `packages/ui/@/` directory entirely
once Step 5 below is done; it's CLI scratch output, not part of the package). The real target
file is replaced in the next step.

- [ ] **Step 5: Replace the generated file with the restyled version**

Replace the full contents of `packages/ui/src/components/ui/tabs.tsx` with:

```tsx
"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ComponentProps } from "react";

import { cn } from "../../lib/utils";

function Tabs({ className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root className={cn("flex flex-col gap-8", className)} {...props} />;
}

function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex items-center gap-1 self-center rounded-full border border-border p-1",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "rounded-full px-6 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-foreground transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
```

This converts the CLI's `@/lib/utils` import to the repo's relative-import convention (required — the `@/*` alias doesn't exist in this package, see Global Constraints) and replaces shadcn's default underline-tab look with the source's pill segmented control and instant color-swap active state.

- [ ] **Step 6: Delete the CLI's stray `@/` scratch directory, if one was created**

```bash
rm -rf packages/ui/@
```

- [ ] **Step 7: Run the test and confirm it passes**

Run: `pnpm --filter @mocha/ui exec vitest run src/components/ui/tabs.test.tsx`
Expected: PASS.

- [ ] **Step 8: Export `Tabs` and verify lint/typecheck**

Modify `packages/ui/src/index.ts` — add:

```typescript
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
```

Run: `pnpm --filter @mocha/ui lint && pnpm --filter @mocha/ui typecheck`
Expected: both clean.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/package.json pnpm-lock.yaml packages/ui/src/components/ui/tabs.tsx packages/ui/src/components/ui/tabs.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add shadcn Tabs primitive restyled to the site palette"
```

---

### Task 2: Add the restyled `Accordion` primitive

**Files:**
- Modify: `packages/ui/package.json` (via CLI)
- Modify: `pnpm-lock.yaml` (via CLI)
- Create: `packages/ui/src/components/ui/accordion.tsx`
- Test: `packages/ui/src/components/ui/accordion.test.tsx`
- Modify: `packages/ui/src/styles.css`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: `cn()` from `packages/ui/src/lib/utils.ts`; `--color-border`, `--color-foreground`, `--color-primary`, `--color-muted` theme tokens (existing).
- Produces: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` — restyled wrappers around `@radix-ui/react-accordion`'s `Root`/`Item`/`Trigger`/`Content` (via its `Header`), each accepting that primitive's own props plus an optional `className`. `Accordion` is used with `type="single" collapsible` by consumers for single-open behavior.

- [ ] **Step 1: Write the failing test**

Create `packages/ui/src/components/ui/accordion.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

describe("Accordion", () => {
  it("keeps only one item open at a time", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>Question A</AccordionTrigger>
          <AccordionContent>Answer A</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Question B</AccordionTrigger>
          <AccordionContent>Answer B</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Question A" }));
    expect(screen.getByText("Answer A")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Question B" }));
    expect(screen.getByText("Answer B")).toBeInTheDocument();
    expect(screen.queryByText("Answer A")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm --filter @mocha/ui exec vitest run src/components/ui/accordion.test.tsx`
Expected: FAIL — `./accordion` does not exist.

- [ ] **Step 3: Scaffold via the shadcn CLI**

```bash
cd packages/ui && pnpm dlx shadcn@latest add accordion --yes
```

This installs `@radix-ui/react-accordion` and `lucide-react`, and writes an initial
`packages/ui/src/components/ui/accordion.tsx` using `@/lib/utils` — replaced next.

- [ ] **Step 4: Replace the generated file with the restyled version**

Replace the full contents of `packages/ui/src/components/ui/accordion.tsx` with:

```tsx
"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "../../lib/utils";

function Accordion(props: ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root {...props} />;
}

function AccordionItem({ className, ...props }: ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn("border-b border-border last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "flex flex-1 items-center justify-between gap-4 py-5 text-left font-serif text-xl text-foreground [&[data-state=open]>svg]:rotate-45",
          className,
        )}
        {...props}
      >
        {children}
        <Plus className="size-5 shrink-0 text-primary transition-transform duration-300" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden text-sm text-muted data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pb-5", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
```

This converts the CLI's `@/lib/utils` import to a relative import, swaps the default chevron for a
`Plus` icon that rotates 45° open (matching the source's "+" that becomes a "×"), and uses
`data-[state=open]`/`data-[state=closed]` to drive the height-animation classes added in Step 5.

- [ ] **Step 5: Add the accordion height-animation keyframes**

Radix's `Accordion.Content` exposes a `--radix-accordion-content-height` CSS variable but has no
built-in animation of its own — the keyframes referenced by Step 4's `animate-accordion-up`/
`animate-accordion-down` classes must be defined. Replace the final two blocks of
`packages/ui/src/styles.css` (the existing `@theme inline { ... }` block and the `@keyframes
floatUp { ... }` block) with:

```css
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

  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
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

@keyframes accordion-down {
  from {
    height: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
  }
}

@keyframes accordion-up {
  from {
    height: var(--radix-accordion-content-height);
  }
  to {
    height: 0;
  }
}
```

- [ ] **Step 6: Run the test and confirm it passes**

Run: `pnpm --filter @mocha/ui exec vitest run src/components/ui/accordion.test.tsx`
Expected: PASS.

- [ ] **Step 7: Export `Accordion` and verify lint/typecheck**

Modify `packages/ui/src/index.ts` — add:

```typescript
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/ui/accordion";
```

Run: `pnpm --filter @mocha/ui lint && pnpm --filter @mocha/ui typecheck`
Expected: both clean.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/package.json pnpm-lock.yaml packages/ui/src/components/ui/accordion.tsx packages/ui/src/components/ui/accordion.test.tsx packages/ui/src/styles.css packages/ui/src/index.ts
git commit -m "feat(ui): add shadcn Accordion primitive restyled to the site palette"
```

---

### Task 3: Build the `TabSwitch` primitive

**Files:**
- Create: `packages/ui/src/components/tab-switch.tsx`
- Test: `packages/ui/src/components/tab-switch.test.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger` from `./ui/tabs` (Task 1).
- Produces: `TabSwitch(props: TabSwitchProps): JSX.Element` where
  `TabSwitchProps = { tabs: { id: string; label: string; panel: ReactNode }[]; defaultTabId?: string }`
  (`defaultTabId` defaults to `tabs[0].id`). This is the primitive Session 3's Stay section should
  reuse for its On-Estate/Downtown-Chattanooga tabs instead of building a second tab switch.

- [ ] **Step 1: Write the failing test**

Create `packages/ui/src/components/tab-switch.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { TabSwitch } from "./tab-switch";

describe("TabSwitch", () => {
  it("renders all tab labels and swaps the visible panel on click", async () => {
    const user = userEvent.setup();
    render(
      <TabSwitch
        tabs={[
          { id: "a", label: "Tab A", panel: <p>Panel A</p> },
          { id: "b", label: "Tab B", panel: <p>Panel B</p> },
        ]}
      />,
    );

    expect(screen.getByRole("tab", { name: "Tab A" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tab B" })).toBeInTheDocument();
    expect(screen.getByText("Panel A")).toBeInTheDocument();
    expect(screen.queryByText("Panel B")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Tab B" }));

    expect(screen.getByText("Panel B")).toBeInTheDocument();
    expect(screen.queryByText("Panel A")).not.toBeInTheDocument();
  });
});
```

`@testing-library/user-event` is required here for the same reason as Task 1's `Tabs` test — Radix's
`Tabs.Trigger` (which `TabSwitch` renders under the hood) activates on `onMouseDown`/`onFocus`, not
`onClick`; it's already a `packages/ui` devDependency from Task 1, no reinstall needed.

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm --filter @mocha/ui exec vitest run src/components/tab-switch.test.tsx`
Expected: FAIL — `./tab-switch` does not exist.

- [ ] **Step 3: Implement `TabSwitch`**

Create `packages/ui/src/components/tab-switch.tsx`:

```tsx
import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

// Generic tab-switch primitive. Built for Explore's Chattanooga/Atlanta tabs; Session 3's Stay
// section needs an equivalent On-Estate/Downtown-Chattanooga tab switch — reuse this rather than
// building a second one.
export type TabSwitchProps = {
  tabs: { id: string; label: string; panel: ReactNode }[];
  defaultTabId?: string;
};

export function TabSwitch({ tabs, defaultTabId }: TabSwitchProps) {
  return (
    <Tabs defaultValue={defaultTabId ?? tabs[0]?.id}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          {tab.panel}
        </TabsContent>
      ))}
    </Tabs>
  );
}
```

`TabSwitch` itself carries no `"use client"` directive — it only composes the already-client
`Tabs` primitive, so it stays a server-renderable wrapper; the `panel` content a caller supplies
(including further Server Components) passes through untouched.

- [ ] **Step 4: Run the test and confirm it passes**

Run: `pnpm --filter @mocha/ui exec vitest run src/components/tab-switch.test.tsx`
Expected: PASS.

- [ ] **Step 5: Export `TabSwitch` and verify lint/typecheck**

Modify `packages/ui/src/index.ts` — add:

```typescript
export { TabSwitch } from "./components/tab-switch";
export type { TabSwitchProps } from "./components/tab-switch";
```

Run: `pnpm --filter @mocha/ui lint && pnpm --filter @mocha/ui typecheck`
Expected: both clean.

- [ ] **Step 6: Run the full `packages/ui` suite**

Run: `pnpm --filter @mocha/ui test`
Expected: PASS — all tests, including Tasks 1–2's, plus the existing suite from Session 1.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/tab-switch.tsx packages/ui/src/components/tab-switch.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add reusable TabSwitch primitive"
```

---

### Task 4: Build the Explore section

**Files:**
- Create: `apps/blackberry/src/components/explore-content.ts`
- Create: `apps/blackberry/src/components/explore.tsx`

**Interfaces:**
- Consumes: `Reveal`, `TabSwitch` from `@mocha/ui` (existing; Task 3).
- Produces: `Explore(): JSX.Element`, a Server Component with `id="explore"`, consumed by Task 7.
  `explore-content.ts` exports `ExploreActivity`, `ExploreTab`, `EXPLORE_EYEBROW`,
  `EXPLORE_HEADING`, `EXPLORE_INTRO`, `EXPLORE_TABS`.

- [ ] **Step 1: Write the content data**

Create `apps/blackberry/src/components/explore-content.ts`:

```ts
export type ExploreActivity = {
  name: string;
  description: string;
};

export type ExploreTab = {
  id: string;
  label: string;
  activities: ExploreActivity[];
};

export const EXPLORE_EYEBROW = "Make a Trip of It";
export const EXPLORE_HEADING = "Things to Do";
export const EXPLORE_INTRO =
  "Two great cities bookend the venue. A few of our favorite ways to spend the extra hours, whether you fly into Chattanooga or Atlanta.";

export const EXPLORE_TABS: ExploreTab[] = [
  {
    id: "chattanooga",
    label: "Chattanooga · 30 min",
    activities: [
      {
        name: "Lookout Mountain",
        description:
          "Ruby Falls, Rock City & the Incline Railway — see seven states from the overlook.",
      },
      {
        name: "Tennessee Aquarium",
        description: "One of the best in the country, right on the revitalized downtown riverfront.",
      },
      {
        name: "Walnut Street Bridge",
        description: "Stroll the historic pedestrian bridge and the Riverwalk at golden hour.",
      },
      {
        name: "Bluff View Art District",
        description: "Cobblestone streets, gardens, galleries and café pastries above the river.",
      },
      {
        name: "Downtown Dining",
        description: "From St. John's to Main Street Meats — Chattanooga's food scene punches up.",
      },
      {
        name: "Coolidge Park",
        description: "Antique carousel, riverfront lawns and easy afternoons on the North Shore.",
      },
    ],
  },
  {
    id: "atlanta",
    label: "Atlanta · 2 hrs",
    activities: [
      {
        name: "Georgia Aquarium",
        description: "The largest in the Western Hemisphere — whale sharks and all.",
      },
      {
        name: "Ponce City Market",
        description: "Food hall, rooftop games and shops in a landmark Beltline building.",
      },
      {
        name: "The Atlanta BeltLine",
        description: "Walk or bike the Eastside Trail past murals, breweries and parks.",
      },
      {
        name: "Piedmont Park",
        description: "Atlanta's green heart, with skyline views and the Botanical Garden next door.",
      },
      {
        name: "World of Coca-Cola",
        description: "A only-in-Atlanta classic beside the Civil Rights Center downtown.",
      },
      {
        name: "Historic Sweet Auburn",
        description: "The MLK Jr. National Historical Park and the soul of the city.",
      },
    ],
  },
];
```

The `World of Coca-Cola` description ("A only-in-Atlanta classic...") is copied verbatim from the
reference doc, including its phrasing — this plan reproduces source copy exactly rather than
correcting it.

- [ ] **Step 2: Implement `Explore`**

Create `apps/blackberry/src/components/explore.tsx`:

```tsx
import { Reveal, TabSwitch } from "@mocha/ui";

import {
  EXPLORE_EYEBROW,
  EXPLORE_HEADING,
  EXPLORE_INTRO,
  EXPLORE_TABS,
  type ExploreActivity,
} from "./explore-content";

function ExploreGrid({ activities }: { activities: ExploreActivity[] }) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {activities.map((activity, index) => (
        <Reveal key={activity.name} delay={(index % 3) * 0.085}>
          <div>
            <div
              aria-hidden="true"
              className="aspect-[16/10] rounded-lg bg-gradient-to-br from-bb-peach to-bb-blush"
            />
            <h3 className="mt-4 font-serif text-xl text-foreground">{activity.name}</h3>
            <p className="mt-2 text-sm text-muted">{activity.description}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function Explore() {
  return (
    <section id="explore" className="bg-background px-6 py-24 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-bb-clay">{EXPLORE_EYEBROW}</p>
            <h2 className="mt-3 font-serif text-4xl text-foreground sm:text-5xl">
              {EXPLORE_HEADING}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm text-muted sm:text-base">
              {EXPLORE_INTRO}
            </p>
          </div>
        </Reveal>

        <div className="mt-14">
          <TabSwitch
            defaultTabId="chattanooga"
            tabs={EXPLORE_TABS.map((tab) => ({
              id: tab.id,
              label: tab.label,
              panel: <ExploreGrid activities={tab.activities} />,
            }))}
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify typecheck and lint**

Run: `pnpm exec turbo run typecheck --filter=@mocha/blackberry`
Expected: PASS (this also runs the `typegen` dependency so `tsc` sees generated Next.js types).

Run: `pnpm --filter @mocha/blackberry lint`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add apps/blackberry/src/components/explore-content.ts apps/blackberry/src/components/explore.tsx
git commit -m "feat(blackberry): add Explore section"
```

---

### Task 5: Build the Details section

**Files:**
- Create: `apps/blackberry/src/components/details-content.ts`
- Create: `apps/blackberry/src/components/details.tsx`

**Interfaces:**
- Consumes: `Reveal` from `@mocha/ui` (existing).
- Produces: `Details(): JSX.Element`, a Server Component with `id="details"`, consumed by Task 7.
  `details-content.ts` exports `RegistryLink`, `DETAILS_DRESS_EYEBROW`,
  `DETAILS_DRESS_HEADING`, `DETAILS_DRESS_EMPHASIS`, `DETAILS_DRESS_BODY`,
  `DETAILS_DRESS_FOOTNOTE`, `DETAILS_DRESS_SWATCHES`, `DETAILS_REGISTRY_EYEBROW`,
  `DETAILS_REGISTRY_HEADING`, `DETAILS_REGISTRY_BODY`, `DETAILS_REGISTRY_LINKS`.

- [ ] **Step 1: Write the content data**

Create `apps/blackberry/src/components/details-content.ts`:

```ts
export type RegistryLink = {
  label: string;
  href: string;
};

export const DETAILS_DRESS_EYEBROW = "What to Wear";
export const DETAILS_DRESS_HEADING = "Dress Code";
export const DETAILS_DRESS_EMPHASIS = "Garden Formal";
export const DETAILS_DRESS_BODY =
  "Think dusty rose, terracotta, sage & warm neutrals to match the fall gardens. Suits and cocktail dresses, florals encouraged.";
export const DETAILS_DRESS_FOOTNOTE =
  "A note on shoes: the ceremony is on grass & garden paths — block heels or flats will thank you.";
export const DETAILS_DRESS_SWATCHES = ["#F7DDD0", "#F2C7B4", "#C3A6A8", "#C79B7E", "#B2795E"];

export const DETAILS_REGISTRY_EYEBROW = "Gifts";
export const DETAILS_REGISTRY_HEADING = "Registry";
export const DETAILS_REGISTRY_BODY =
  "Your presence is the gift — truly. But if you'd like to help us feather the nest (and fund the honeymoon), we've put together a few things below.";

export const DETAILS_REGISTRY_LINKS: RegistryLink[] = [
  { label: "Crate & Barrel", href: "#rsvp" },
  { label: "Zola Registry", href: "#rsvp" },
  { label: "Honeymoon Fund", href: "#rsvp" },
];
```

- [ ] **Step 2: Implement `Details`**

Create `apps/blackberry/src/components/details.tsx`:

```tsx
import { Reveal } from "@mocha/ui";

import {
  DETAILS_DRESS_BODY,
  DETAILS_DRESS_EMPHASIS,
  DETAILS_DRESS_EYEBROW,
  DETAILS_DRESS_FOOTNOTE,
  DETAILS_DRESS_HEADING,
  DETAILS_DRESS_SWATCHES,
  DETAILS_REGISTRY_BODY,
  DETAILS_REGISTRY_EYEBROW,
  DETAILS_REGISTRY_HEADING,
  DETAILS_REGISTRY_LINKS,
} from "./details-content";

export function Details() {
  return (
    <section id="details" className="bg-bb-peach px-6 py-24 sm:px-12">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
        <Reveal>
          <div className="rounded-lg bg-surface p-10">
            <p className="text-xs uppercase tracking-[0.28em] text-bb-clay">
              {DETAILS_DRESS_EYEBROW}
            </p>
            <h2 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
              {DETAILS_DRESS_HEADING}
            </h2>
            <p className="mt-4 font-serif text-2xl text-foreground">{DETAILS_DRESS_EMPHASIS}</p>
            <p className="mt-4 text-sm text-muted">{DETAILS_DRESS_BODY}</p>
            <div className="mt-6 flex gap-3">
              {DETAILS_DRESS_SWATCHES.map((hex) => (
                <span
                  key={hex}
                  aria-hidden="true"
                  className="size-10 rounded-full border border-border"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
            <p className="mt-6 font-serif text-sm text-muted italic">{DETAILS_DRESS_FOOTNOTE}</p>
          </div>
        </Reveal>

        <Reveal delay={0.085}>
          <div className="rounded-lg bg-surface p-10">
            <p className="text-xs uppercase tracking-[0.28em] text-bb-clay">
              {DETAILS_REGISTRY_EYEBROW}
            </p>
            <h2 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
              {DETAILS_REGISTRY_HEADING}
            </h2>
            <p className="mt-4 text-sm text-muted">{DETAILS_REGISTRY_BODY}</p>
            <ul className="mt-6 divide-y divide-border">
              {DETAILS_REGISTRY_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="flex items-center justify-between py-4 text-sm uppercase tracking-[0.12em] text-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                    <span aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify typecheck and lint**

Run: `pnpm exec turbo run typecheck --filter=@mocha/blackberry`
Expected: PASS.

Run: `pnpm --filter @mocha/blackberry lint`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add apps/blackberry/src/components/details-content.ts apps/blackberry/src/components/details.tsx
git commit -m "feat(blackberry): add Details section"
```

---

### Task 6: Build the FAQ section

**Files:**
- Create: `apps/blackberry/src/components/faq-content.ts`
- Create: `apps/blackberry/src/components/faq.tsx`

**Interfaces:**
- Consumes: `Accordion`, `AccordionContent`, `AccordionItem`, `AccordionTrigger`, `Reveal` from
  `@mocha/ui` (Task 2; existing).
- Produces: `Faq(): JSX.Element`, a Server Component with `id="faq"`, consumed by Task 7.
  `faq-content.ts` exports `FaqItem`, `FAQ_EYEBROW`, `FAQ_HEADING`, `FAQ_ITEMS`.

- [ ] **Step 1: Write the content data**

Create `apps/blackberry/src/components/faq-content.ts`:

```ts
export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ_EYEBROW = "Good to Know";
export const FAQ_HEADING = "Questions?";

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Can I bring a plus-one?",
    answer:
      "We've reserved seats for the guests named on your invitation. If your RSVP form lets you add a guest, you're all set — otherwise reach out to us directly.",
  },
  {
    question: "Are kids welcome?",
    answer:
      "We love your little ones! This is a family-friendly weekend. Let us know how many children to expect on your RSVP so we can plan.",
  },
  {
    question: "What's the weather like in early October?",
    answer:
      "North Georgia falls are gorgeous — sunny days around 70°F and cool evenings in the 50s. Bring a layer for the outdoor ceremony and reception patio.",
  },
  {
    question: "Is the ceremony indoors or outdoors?",
    answer:
      "The ceremony is outdoors in the garden (with a covered backup for weather). Cocktails are on the patio; dinner and dancing move into the Grand Hall.",
  },
  {
    question: "Will there be a shuttle?",
    answer:
      "Yes — a shuttle will run between the downtown Chattanooga hotel block and the Villa on Saturday. Times will be shared as we get closer.",
  },
  {
    question: "When should I RSVP by?",
    answer:
      "Please respond by August 1, 2027 so we can give the venue a final headcount. The sooner the better!",
  },
];
```

- [ ] **Step 2: Implement `Faq`**

Create `apps/blackberry/src/components/faq.tsx`:

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Reveal } from "@mocha/ui";

import { FAQ_EYEBROW, FAQ_HEADING, FAQ_ITEMS } from "./faq-content";

export function Faq() {
  return (
    <section id="faq" className="bg-background px-6 py-24 sm:px-12">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-bb-clay">{FAQ_EYEBROW}</p>
            <h2 className="mt-3 font-serif text-4xl text-foreground sm:text-5xl">{FAQ_HEADING}</h2>
          </div>
        </Reveal>

        <Reveal delay={0.085}>
          <Accordion type="single" collapsible className="mt-14">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify typecheck and lint**

Run: `pnpm exec turbo run typecheck --filter=@mocha/blackberry`
Expected: PASS.

Run: `pnpm --filter @mocha/blackberry lint`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add apps/blackberry/src/components/faq-content.ts apps/blackberry/src/components/faq.tsx
git commit -m "feat(blackberry): add FAQ section"
```

---

### Task 7: Compose the sections into the page

**Files:**
- Modify: `apps/blackberry/src/app/page.tsx`

**Interfaces:**
- Consumes: `Explore` (Task 4), `Details` (Task 5), `Faq` (Task 6).
- Produces: the composed `Home` page — no new exports for later tasks.

- [ ] **Step 1: Replace `page.tsx`**

Replace the full contents of `apps/blackberry/src/app/page.tsx` with:

```tsx
import { CountdownStrip, Hero, SiteFooter, SiteNav } from "@mocha/ui";

import heroPhoto from "@/assets/hero.jpeg";
import { Details } from "@/components/details";
import { Explore } from "@/components/explore";
import { Faq } from "@/components/faq";

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

      <main>
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

        {/* Session 2 adds Schedule of Events and Wedding Party here. */}
        {/* Session 3 adds Travel & Directions and Accommodations (Stay) here. */}

        <Explore />
        <Details />
        <Faq />

        {/* Session 5 adds RSVP here. */}
      </main>

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

- [ ] **Step 2: Verify typecheck, lint, and build**

Run: `pnpm exec turbo run typecheck --filter=@mocha/blackberry`
Expected: PASS.

Run: `pnpm --filter @mocha/blackberry lint`
Expected: clean.

Run: `pnpm --filter @mocha/blackberry build`
Expected: PASS — confirms the composed page (including the client `Tabs`/`Accordion` boundaries)
builds correctly under Next.js's RSC compiler.

- [ ] **Step 3: Manual visual check**

Run: `pnpm --filter @mocha/blackberry dev`, open `http://localhost:3001`, and confirm:
- `#explore` shows the two-tab switch; clicking each tab swaps the 6-card grid (3 cols desktop,
  stacking to 1 col on a narrow viewport), each card showing a gradient placeholder block.
- `#details` shows the Dress Code and Registry cards side by side, stacking on a narrow viewport.
- `#faq` shows the 6-item accordion; opening one item closes any other open item, and the "+"
  rotates into a "×".

Stop the dev server after confirming.

- [ ] **Step 4: Commit**

```bash
git add apps/blackberry/src/app/page.tsx
git commit -m "feat(blackberry): compose Explore, Details, and FAQ into the page"
```

---

### Task 8: Full repository verification

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Run the complete verification suite from the repository root**

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: all four commands pass, including `@mocha/canton`'s unmodified build and `@mocha/ui`'s
full test suite (Session 1's tests plus this plan's new `Tabs`/`Accordion`/`TabSwitch` tests).

- [ ] **Step 2: Confirm a clean working tree**

Run: `git status --short`
Expected: empty — every task committed its own changes.

- [ ] **Step 3: Review the branch's full diff against `main`**

Run: `git log main..HEAD --oneline` and `git diff main...HEAD --stat`
Expected: one commit per task above, touching only the files listed in the File Responsibility
Map — nothing under `apps/canton`.
