# Blackberry Wedding RSVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the RSVP form (`#rsvp`) for `apps/blackberry` — a multi-field, conditionally-branching form (react-hook-form + Zod), matching the source design's copy, visual states, and client-only thank-you flow, composed into `page.tsx` directly before `SiteFooter`.

**Architecture:** `packages/ui` gains generic, content-agnostic shadcn primitives (`Label`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Form`) with zero RSVP copy. `apps/blackberry` owns the actual RSVP form: its field list, copy, option values, and the Zod schema with its conditional-required rules, split into a static Server Component (`RsvpSection`) wrapping a client component (`RsvpForm`).

**Tech Stack:** Next.js 16 / React 19, Tailwind v4, shadcn/ui (`new-york` style) on Radix primitives, react-hook-form + Zod + `@hookform/resolvers`, Vitest + Testing Library + `@testing-library/user-event`.

## Global Constraints

- Use pnpm; every dependency addition below uses `pnpm --filter <package> add ...` — never edit a `package.json` dependency block by hand except where explicitly noted (the `peerDependencies` entry in Task 6, which pnpm's CLI can't add directly).
- No Blackberry-specific copy, hex value, or field name may appear inside any `packages/ui` file.
- No backend, network call, storage, or environment variable may be introduced — RSVP submission is client-only local state, matching the approved spec.
- Every new `packages/ui` component is hand-restyled to the existing `--site-*` → `@theme inline` → `--color-*` token convention: no shadcn default `dark:` variants (this repo has no dark mode) and no unwired shadcn tokens (`--input`, `--ring`, `--accent`, `--secondary`) — reuse `border-border`, `bg-background`/`bg-surface`, `ring-primary`, and the new `--color-destructive` this plan adds.
- `packages/ui` component imports are relative (`../../lib/utils`), never `@/...` — shadcn's CLI output must be hand-converted if used.
- Required-field policy (Zod): `fullName`/`email` always required; `attending` always required; `guestCount`/`events` (≥1)/`mealPreference`/`lodgingPreference` required only when `attending === "yes"`; `dietaryRestrictions`/`songRequest`/`message` always optional.
- Before the final task, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` must all pass from the repository root.

---

### Task 1: Shared `--site-destructive` token

**Files:**
- Modify: `packages/ui/src/styles.css`
- Modify: `apps/blackberry/src/app/globals.css`
- Test: (no new test file — verified by re-running the existing `@mocha/ui` suite, since this task only adds a CSS custom property)

**Interfaces:**
- Produces: Tailwind utility classes `text-destructive` / `border-destructive` / `ring-destructive`, backed by `--color-destructive`, usable from any `packages/ui` or `apps/blackberry` component from Task 2 onward.

- [ ] **Step 1: Add the neutral shared slot in `packages/ui/src/styles.css`**

In the `:root` block, change:
```css
  --site-inverted-background: #1a1a1a;
  --site-inverted-foreground: #ffffff;
}
```
to:
```css
  --site-inverted-background: #1a1a1a;
  --site-inverted-foreground: #ffffff;
  --site-destructive: #b91c1c;
}
```

In the `@theme inline` block, change:
```css
  --color-inverted-background: var(--site-inverted-background);
  --color-inverted-foreground: var(--site-inverted-foreground);
}
```
to:
```css
  --color-inverted-background: var(--site-inverted-background);
  --color-inverted-foreground: var(--site-inverted-foreground);
  --color-destructive: var(--site-destructive);
}
```

- [ ] **Step 2: Override it with Blackberry's real value in `apps/blackberry/src/app/globals.css`**

Change:
```css
  --site-inverted-background: #000000;
  --site-inverted-foreground: #ffffff;

  /* Blackberry's local editorial palette — not part of the shared @mocha/ui token contract. */
```
to:
```css
  --site-inverted-background: #000000;
  --site-inverted-foreground: #ffffff;
  --site-destructive: #b3261e;

  /* Blackberry's local editorial palette — not part of the shared @mocha/ui token contract. */
```

- [ ] **Step 3: Confirm no regression**

Run: `pnpm --filter @mocha/ui test && pnpm --filter @mocha/ui typecheck`
Expected: PASS (Canton's `SiteShell` test and every existing `packages/ui` test still pass unmodified).

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/styles.css apps/blackberry/src/app/globals.css
git commit -m "feat(ui): add the destructive token slot for form validation errors"
```

---

### Task 2: `Label`, `Input`, `Textarea` primitives

**Files:**
- Create: `packages/ui/src/components/ui/label.tsx`
- Create: `packages/ui/src/components/ui/label.test.tsx`
- Create: `packages/ui/src/components/ui/input.tsx`
- Create: `packages/ui/src/components/ui/input.test.tsx`
- Create: `packages/ui/src/components/ui/textarea.tsx`
- Create: `packages/ui/src/components/ui/textarea.test.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/package.json` (via `pnpm add`)

**Interfaces:**
- Consumes: `cn` from `packages/ui/src/lib/utils.ts` (existing).
- Produces: `Label` (props: `ComponentProps<typeof LabelPrimitive.Root>`, i.e. accepts `htmlFor`, `className`, `children`), `Input` (props: `ComponentProps<"input">`), `Textarea` (props: `ComponentProps<"textarea">`) — all exported from `@mocha/ui`.

- [ ] **Step 1: Install the Radix Label package and the user-event test helper**

```bash
pnpm --filter @mocha/ui add @radix-ui/react-label
pnpm --filter @mocha/ui add -D @testing-library/user-event
```

- [ ] **Step 2: Write the failing `Label` test**

`packages/ui/src/components/ui/label.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Label } from "./label";

describe("Label", () => {
  it("associates with its control via htmlFor", () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm --filter @mocha/ui exec vitest run src/components/ui/label.test.tsx`
Expected: FAIL — cannot find module `./label`.

- [ ] **Step 4: Implement `Label`**

`packages/ui/src/components/ui/label.tsx`:
```tsx
"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import type { ComponentProps } from "react";

import { cn } from "../../lib/utils";

function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "text-sm font-medium uppercase tracking-[0.12em] peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
```

Note: no color class here — the source's "field labels are `clay`" is Blackberry-specific brand color, applied via `className` where `RsvpForm` renders `<FormLabel className="text-bb-clay">`, not baked into this shared primitive.

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm --filter @mocha/ui exec vitest run src/components/ui/label.test.tsx`
Expected: PASS

- [ ] **Step 6: Write the failing `Input` test**

`packages/ui/src/components/ui/input.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Input } from "./input";

describe("Input", () => {
  it("accepts typed text", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="you@email.com" />);
    const input = screen.getByPlaceholderText("you@email.com");
    await user.type(input, "guest@example.com");
    expect(input).toHaveValue("guest@example.com");
  });
});
```

- [ ] **Step 7: Run it to verify it fails, then implement `Input`**

Run: `pnpm --filter @mocha/ui exec vitest run src/components/ui/input.test.tsx` — expect FAIL (module not found).

`packages/ui/src/components/ui/input.tsx`:
```tsx
import type { ComponentProps } from "react";

import { cn } from "../../lib/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
```

Run again: PASS.

- [ ] **Step 8: Write the failing `Textarea` test, then implement it**

`packages/ui/src/components/ui/textarea.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("accepts typed text", async () => {
    const user = userEvent.setup();
    render(<Textarea placeholder="Can't wait to celebrate with you both!" />);
    const textarea = screen.getByPlaceholderText("Can't wait to celebrate with you both!");
    await user.type(textarea, "So excited!");
    expect(textarea).toHaveValue("So excited!");
  });
});
```

Run: `pnpm --filter @mocha/ui exec vitest run src/components/ui/textarea.test.tsx` — expect FAIL.

`packages/ui/src/components/ui/textarea.tsx`:
```tsx
import type { ComponentProps } from "react";

import { cn } from "../../lib/utils";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
```

Run again: PASS.

- [ ] **Step 9: Export all three from `packages/ui/src/index.ts`**

Add, after the existing `Button`/`ButtonProps` export lines:
```ts
export { Label } from "./components/ui/label";
export { Input } from "./components/ui/input";
export { Textarea } from "./components/ui/textarea";
```

- [ ] **Step 10: Run the full `packages/ui` suite and typecheck**

Run: `pnpm --filter @mocha/ui test && pnpm --filter @mocha/ui typecheck`
Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add packages/ui/src/components/ui/label.tsx packages/ui/src/components/ui/label.test.tsx \
  packages/ui/src/components/ui/input.tsx packages/ui/src/components/ui/input.test.tsx \
  packages/ui/src/components/ui/textarea.tsx packages/ui/src/components/ui/textarea.test.tsx \
  packages/ui/src/index.ts packages/ui/package.json pnpm-lock.yaml
git commit -m "feat(ui): add Label, Input, and Textarea primitives"
```

---

### Task 3: `Select` primitive

**Files:**
- Create: `packages/ui/src/components/ui/select.tsx`
- Create: `packages/ui/src/components/ui/select.test.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/vitest.setup.ts`
- Modify: `packages/ui/package.json` (via `pnpm add`)

**Interfaces:**
- Consumes: `cn` (Task setup).
- Produces: `Select` (= `SelectPrimitive.Root`), `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue` — exported from `@mocha/ui`. Used by `apps/blackberry`'s guest-count field in Task 8.

- [ ] **Step 1: Install Radix Select and the icon library**

```bash
pnpm --filter @mocha/ui add @radix-ui/react-select lucide-react
```

- [ ] **Step 2: Add the jsdom polyfills Radix `Select` needs, to `packages/ui/vitest.setup.ts`**

Radix's `Select` calls `Element.prototype.hasPointerCapture`/`releasePointerCapture`/`scrollIntoView`, none of which jsdom implements. Append to the end of the file:
```ts
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
```

- [ ] **Step 3: Write the failing test**

`packages/ui/src/components/ui/select.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

describe("Select", () => {
  it("lets the user choose an option", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select guest count" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1</SelectItem>
          <SelectItem value="2">2</SelectItem>
        </SelectContent>
      </Select>,
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "2" }));

    expect(onValueChange).toHaveBeenCalledWith("2");
  });
});
```

- [ ] **Step 4: Run it to verify it fails**

Run: `pnpm --filter @mocha/ui exec vitest run src/components/ui/select.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 5: Implement `Select`**

`packages/ui/src/components/ui/select.tsx`:
```tsx
"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "../../lib/utils";

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

function SelectTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-11 w-full items-center justify-between rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 opacity-60" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface text-foreground shadow-md",
          position === "popper" && "translate-y-1",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none focus:bg-background data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
```

- [ ] **Step 6: Run it to verify it passes**

Run: `pnpm --filter @mocha/ui exec vitest run src/components/ui/select.test.tsx`
Expected: PASS

- [ ] **Step 7: Export from `packages/ui/src/index.ts`**

Add:
```ts
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
```

- [ ] **Step 8: Run the full suite and typecheck**

Run: `pnpm --filter @mocha/ui test && pnpm --filter @mocha/ui typecheck`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/components/ui/select.tsx packages/ui/src/components/ui/select.test.tsx \
  packages/ui/src/index.ts packages/ui/vitest.setup.ts packages/ui/package.json pnpm-lock.yaml
git commit -m "feat(ui): add Select primitive"
```

---

### Task 4: `Checkbox` primitive

**Files:**
- Create: `packages/ui/src/components/ui/checkbox.tsx`
- Create: `packages/ui/src/components/ui/checkbox.test.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/package.json` (via `pnpm add`)

**Interfaces:**
- Consumes: `cn`; `lucide-react`'s `Check` icon (already installed in Task 3).
- Produces: `Checkbox` (props: `ComponentProps<typeof CheckboxPrimitive.Root>`, i.e. `checked`, `onCheckedChange`, `aria-label`, etc.) — exported from `@mocha/ui`. Used by `apps/blackberry`'s events field in Task 8.

- [ ] **Step 1: Install Radix Checkbox**

```bash
pnpm --filter @mocha/ui add @radix-ui/react-checkbox
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/components/ui/checkbox.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("toggles checked state on click", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Friday Welcome Party" />);
    const checkbox = screen.getByRole("checkbox", { name: "Friday Welcome Party" });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm --filter @mocha/ui exec vitest run src/components/ui/checkbox.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement `Checkbox`**

`packages/ui/src/components/ui/checkbox.tsx`:
```tsx
"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "../../lib/utils";

function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer size-5 shrink-0 rounded-sm border border-border bg-background data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm --filter @mocha/ui exec vitest run src/components/ui/checkbox.test.tsx`
Expected: PASS

- [ ] **Step 6: Export from `packages/ui/src/index.ts`**

Add:
```ts
export { Checkbox } from "./components/ui/checkbox";
```

- [ ] **Step 7: Run the full suite and typecheck**

Run: `pnpm --filter @mocha/ui test && pnpm --filter @mocha/ui typecheck`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/ui/checkbox.tsx packages/ui/src/components/ui/checkbox.test.tsx \
  packages/ui/src/index.ts packages/ui/package.json pnpm-lock.yaml
git commit -m "feat(ui): add Checkbox primitive"
```

---

### Task 5: `RadioGroup` primitive (the button-group visual)

**Files:**
- Create: `packages/ui/src/components/ui/radio-group.tsx`
- Create: `packages/ui/src/components/ui/radio-group.test.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/package.json` (via `pnpm add`)

**Interfaces:**
- Consumes: `cn`.
- Produces: `RadioGroup` (= restyled `RadioGroupPrimitive.Root`, props include `value`, `onValueChange`), `RadioGroupItem` (= restyled `RadioGroupPrimitive.Item`, props include required `value: string`, `children`) — exported from `@mocha/ui`. Reused three times in `apps/blackberry`'s `RsvpForm` (Task 8): attend toggle, meal preference, lodging preference — this is the source's "button-groups: instant background/border/text-color swap on selection" pattern, implemented once.

- [ ] **Step 1: Install Radix RadioGroup**

```bash
pnpm --filter @mocha/ui add @radix-ui/react-radio-group
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/components/ui/radio-group.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RadioGroup, RadioGroupItem } from "./radio-group";

describe("RadioGroup", () => {
  it("selects one option and reports it as checked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup onValueChange={onValueChange}>
        <RadioGroupItem value="yes">Joyfully accepts</RadioGroupItem>
        <RadioGroupItem value="no">Regretfully declines</RadioGroupItem>
      </RadioGroup>,
    );

    const accept = screen.getByRole("radio", { name: "Joyfully accepts" });
    await user.click(accept);

    expect(onValueChange).toHaveBeenCalledWith("yes");
    expect(accept).toHaveAttribute("data-state", "checked");
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm --filter @mocha/ui exec vitest run src/components/ui/radio-group.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement `RadioGroup`/`RadioGroupItem`**

`packages/ui/src/components/ui/radio-group.tsx`:
```tsx
"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type { ComponentProps } from "react";

import { cn } from "../../lib/utils";

function RadioGroup({ className, ...props }: ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root className={cn("flex flex-wrap gap-3", className)} {...props} />;
}

function RadioGroupItem({
  className,
  children,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-border bg-transparent px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-foreground transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
```

Note: unlike shadcn's default `RadioGroupItem` (a small circle indicator with a separate `<Label>`), this variant makes the *entire pill* the selectable surface with its label text as `children` — matching the source's button-group visual exactly, and remaining a fully valid `role="radio"` element with its own accessible name from its text content.

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm --filter @mocha/ui exec vitest run src/components/ui/radio-group.test.tsx`
Expected: PASS

- [ ] **Step 6: Export from `packages/ui/src/index.ts`**

Add:
```ts
export { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
```

- [ ] **Step 7: Run the full suite and typecheck**

Run: `pnpm --filter @mocha/ui test && pnpm --filter @mocha/ui typecheck`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/ui/radio-group.tsx packages/ui/src/components/ui/radio-group.test.tsx \
  packages/ui/src/index.ts packages/ui/package.json pnpm-lock.yaml
git commit -m "feat(ui): add RadioGroup primitive with the button-group visual"
```

---

### Task 6: `Form` primitive wrapper

**Files:**
- Create: `packages/ui/src/components/ui/form.tsx`
- Create: `packages/ui/src/components/ui/form.test.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/package.json` (via `pnpm add` + one manual edit)

**Interfaces:**
- Consumes: `Label` (Task 2), `cn`, `@radix-ui/react-slot`'s `Slot` (already a dependency).
- Produces: `Form` (= `FormProvider` from react-hook-form), `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `useFormField` — exported from `@mocha/ui`. `apps/blackberry`'s `RsvpForm` (Task 8) wraps its entire `<form>` in `<Form {...form}>` and each field in `<FormField control={form.control} name="..." render={({ field }) => (<FormItem>...</FormItem>)} />`.

Why `react-hook-form` is a **peerDependency** here, not a plain dependency like `framer-motion`: both this primitive (via `useFormContext`) and `apps/blackberry`'s own `useForm()` call (Task 8) must share the exact same React Context instance. Two separate bundled copies of `react-hook-form` would create two different Context objects, and `useFormContext()` inside this file would silently return the wrong (or no) context when used together with a `useForm()` from a different copy — the same reason `react`/`react-dom` are peers here. `packages/ui` also gets it as a matching `devDependency` so this package's own test suite doesn't depend on `apps/blackberry`'s `package.json` existing/being installed first.

- [ ] **Step 1: Install `react-hook-form` as a devDependency, then declare it as a peerDependency**

```bash
pnpm --filter @mocha/ui add -D react-hook-form
```

Open `packages/ui/package.json`. Find the version pnpm just wrote under `"devDependencies"` for `"react-hook-form"` (e.g. `"^7.xx.x"`). Add a `"peerDependencies"` block (create it if it doesn't exist — currently the file has `"peerDependencies": { "next": "^16.0.0", "react": "^19.0.0", "react-dom": "^19.0.0" }`) with a matching entry:

```json
  "peerDependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "<the exact range pnpm wrote into devDependencies>"
  },
```

Then run `pnpm install` from the repo root to relink the workspace.

- [ ] **Step 2: Write the failing test**

This test proves the primitive is resolver-agnostic (no `zod`/`@hookform/resolvers` needed in `packages/ui` — those stay app-level, added in Task 7/8) by using react-hook-form's own built-in `rules` validation.

`packages/ui/src/components/ui/form.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { Input } from "./input";

function TestForm() {
  const form = useForm<{ email: string }>({ defaultValues: { email: "" } });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="email"
          rules={{ required: "Please enter your email." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe("Form", () => {
  it("shows a validation message when a required field is left blank", async () => {
    const user = userEvent.setup();
    render(<TestForm />);

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Please enter your email.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm --filter @mocha/ui exec vitest run src/components/ui/form.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement `Form`**

`packages/ui/src/components/ui/form.tsx`:
```tsx
"use client";

import { Slot } from "@radix-ui/react-slot";
import { createContext, useContext, useId, type ComponentProps } from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "../../lib/utils";
import { Label } from "./label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = { name: TName };

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

type FormItemContextValue = { id: string };
const FormItemContext = createContext<FormItemContextValue | null>(null);

function useFormField() {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext?.name });

  if (!fieldContext || !itemContext) {
    throw new Error("useFormField must be used within <FormField> and <FormItem>");
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

function FormItem({ className, ...props }: ComponentProps<"div">) {
  const id = useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("flex flex-col gap-2", className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField();
  return <Label className={cn(error && "text-destructive", className)} htmlFor={formItemId} {...props} />;
}

function FormControl({ ...props }: ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return (
    <Slot
      id={formItemId}
      aria-describedby={error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId}
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();
  return <p id={formDescriptionId} className={cn("text-sm text-muted", className)} {...props} />;
}

function FormMessage({ className, children, ...props }: ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;
  if (!body) return null;

  return (
    <p id={formMessageId} className={cn("text-sm text-destructive", className)} {...props}>
      {body}
    </p>
  );
}

export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField };
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm --filter @mocha/ui exec vitest run src/components/ui/form.test.tsx`
Expected: PASS

- [ ] **Step 6: Export from `packages/ui/src/index.ts`**

Add:
```ts
export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "./components/ui/form";
```

- [ ] **Step 7: Run the full suite and typecheck**

Run: `pnpm --filter @mocha/ui test && pnpm --filter @mocha/ui typecheck`
Expected: PASS — this is also the point where every primitive from Tasks 2–6 has been exercised together; confirm all prior tests still pass in the same run.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/ui/form.tsx packages/ui/src/components/ui/form.test.tsx \
  packages/ui/src/index.ts packages/ui/package.json pnpm-lock.yaml
git commit -m "feat(ui): add Form primitive wrapper around react-hook-form"
```

---

### Task 7: Blackberry Vitest infrastructure + `rsvp-schema.ts`

**Files:**
- Create: `apps/blackberry/vitest.config.ts`
- Create: `apps/blackberry/vitest.setup.ts`
- Create: `apps/blackberry/src/components/rsvp-schema.ts`
- Create: `apps/blackberry/src/components/rsvp-schema.test.ts`
- Modify: `apps/blackberry/package.json` (add `"test"` script + deps via `pnpm add`)

**Interfaces:**
- Produces: `EVENT_OPTIONS`, `MEAL_OPTIONS`, `GUEST_COUNT_OPTIONS`, `LODGING_OPTIONS` (option constants), `rsvpFormSchema` (Zod schema), `RsvpFormValues` (type) — all from `apps/blackberry/src/components/rsvp-schema.ts`. Consumed by `rsvp-form.tsx` in Task 8.

`apps/blackberry` has no test infrastructure yet (no `vitest.config.ts`, no `test` script) — this task sets up the complete harness in one pass, including the jsdom polyfills already known to be needed by later tasks in this same plan (`Reveal`'s `useReducedMotion` needs `matchMedia`; `Reveal`'s viewport trigger needs `IntersectionObserver`; the `Select`/`RadioGroup`/`Checkbox` fields rendered inside `RsvpForm` need the Radix pointer-capture polyfills), mirroring `packages/ui/vitest.setup.ts` plus those Radix additions — so Tasks 8–9 don't have to patch it incrementally.

- [ ] **Step 1: Install the test toolchain and `zod`**

```bash
pnpm --filter @mocha/blackberry add zod
pnpm --filter @mocha/blackberry add -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

- [ ] **Step 2: Add the `test` script**

In `apps/blackberry/package.json`, in `"scripts"`, add (after `"lint"`):
```json
    "test": "vitest run",
```

- [ ] **Step 3: Create the Vitest config**

`apps/blackberry/vitest.config.ts`:
```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

- [ ] **Step 4: Create the Vitest setup file**

`apps/blackberry/vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

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

if (!window.IntersectionObserver) {
  window.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
  } as unknown as typeof IntersectionObserver;
}

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
```

- [ ] **Step 5: Write the failing schema tests**

`apps/blackberry/src/components/rsvp-schema.test.ts`:
```ts
import { describe, expect, it } from "vitest";

import { rsvpFormSchema } from "./rsvp-schema";

const validBase = {
  fullName: "Jordan Rivera",
  email: "jordan@example.com",
};

describe("rsvpFormSchema", () => {
  it("succeeds when declining, without any conditional fields", () => {
    const result = rsvpFormSchema.safeParse({ ...validBase, attending: "no" });
    expect(result.success).toBe(true);
  });

  it("fails when attending without a meal preference", () => {
    const result = rsvpFormSchema.safeParse({
      ...validBase,
      attending: "yes",
      guestCount: "2",
      events: ["Friday Welcome Party"],
      lodgingPreference: "Making my own arrangements",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join(".") === "mealPreference")).toBe(true);
    }
  });

  it("fails when attending without a guest count, events, or lodging preference", () => {
    const result = rsvpFormSchema.safeParse({ ...validBase, attending: "yes" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join("."));
      expect(paths).toEqual(
        expect.arrayContaining(["guestCount", "events", "mealPreference", "lodgingPreference"]),
      );
    }
  });

  it("succeeds when attending with every required field present", () => {
    const result = rsvpFormSchema.safeParse({
      ...validBase,
      attending: "yes",
      guestCount: "2",
      events: ["Friday Welcome Party"],
      mealPreference: "Herb-Roasted Chicken",
      lodgingPreference: "Making my own arrangements",
    });
    expect(result.success).toBe(true);
  });

  it("succeeds when attending with dietary restrictions, song request, and message omitted", () => {
    const result = rsvpFormSchema.safeParse({
      ...validBase,
      attending: "yes",
      guestCount: "1",
      events: ["Sunday Farewell Brunch"],
      mealPreference: "Wild Mushroom Risotto (V)",
      lodgingPreference: "Downtown Chattanooga hotel",
    });
    expect(result.success).toBe(true);
  });

  it("fails on a malformed email", () => {
    const result = rsvpFormSchema.safeParse({ ...validBase, email: "not-an-email", attending: "no" });
    expect(result.success).toBe(false);
  });

  it("fails on a blank name", () => {
    const result = rsvpFormSchema.safeParse({ ...validBase, fullName: "   ", attending: "no" });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm --filter @mocha/blackberry exec vitest run src/components/rsvp-schema.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 7: Implement the schema**

`apps/blackberry/src/components/rsvp-schema.ts`:
```ts
import { z } from "zod";

export const EVENT_OPTIONS = [
  "Friday Welcome Party",
  "Saturday Ceremony & Reception",
  "Sunday Farewell Brunch",
] as const;

export const MEAL_OPTIONS = [
  "Herb-Roasted Chicken",
  "Braised Short Rib",
  "Pan-Seared Salmon",
  "Wild Mushroom Risotto (V)",
] as const;

export const GUEST_COUNT_OPTIONS = ["1", "2", "3", "4", "5+"] as const;

export const LODGING_OPTIONS = [
  { label: "Staying on the estate", value: "On the estate (Yorkshire Manor & cottages)" },
  { label: "Booking a Chattanooga hotel", value: "Downtown Chattanooga hotel" },
  { label: "I'll make my own arrangements", value: "Making my own arrangements" },
] as const;

const LODGING_VALUES = LODGING_OPTIONS.map((option) => option.value) as [string, ...string[]];

const rsvpBaseSchema = z.object({
  fullName: z.string().trim().min(1, "Please enter your name."),
  email: z.string().trim().min(1, "Please enter your email.").email("Enter a valid email address."),
  attending: z.enum(["yes", "no"], {
    required_error: "Please let us know if you can make it.",
  }),
  guestCount: z.enum(GUEST_COUNT_OPTIONS).optional(),
  events: z.array(z.enum(EVENT_OPTIONS)).optional(),
  mealPreference: z.enum(MEAL_OPTIONS).optional(),
  dietaryRestrictions: z.string().trim().optional(),
  lodgingPreference: z.enum(LODGING_VALUES).optional(),
  songRequest: z.string().trim().optional(),
  message: z.string().trim().optional(),
});

export const rsvpFormSchema = rsvpBaseSchema.superRefine((data, ctx) => {
  if (data.attending !== "yes") return;

  if (!data.guestCount) {
    ctx.addIssue({
      path: ["guestCount"],
      code: z.ZodIssueCode.custom,
      message: "Please select a guest count.",
    });
  }
  if (!data.events || data.events.length === 0) {
    ctx.addIssue({
      path: ["events"],
      code: z.ZodIssueCode.custom,
      message: "Please select at least one event.",
    });
  }
  if (!data.mealPreference) {
    ctx.addIssue({
      path: ["mealPreference"],
      code: z.ZodIssueCode.custom,
      message: "Please select a meal preference.",
    });
  }
  if (!data.lodgingPreference) {
    ctx.addIssue({
      path: ["lodgingPreference"],
      code: z.ZodIssueCode.custom,
      message: "Please select a lodging preference.",
    });
  }
});

export type RsvpFormValues = z.infer<typeof rsvpBaseSchema>;
```

- [ ] **Step 8: Run it to verify it passes**

Run: `pnpm --filter @mocha/blackberry exec vitest run src/components/rsvp-schema.test.ts`
Expected: PASS (all 7 cases)

- [ ] **Step 9: Run the full blackberry suite and typecheck**

Run: `pnpm --filter @mocha/blackberry test && pnpm --filter @mocha/blackberry typecheck`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add apps/blackberry/vitest.config.ts apps/blackberry/vitest.setup.ts \
  apps/blackberry/src/components/rsvp-schema.ts apps/blackberry/src/components/rsvp-schema.test.ts \
  apps/blackberry/package.json pnpm-lock.yaml
git commit -m "test(blackberry): add Vitest infrastructure and the RSVP Zod schema"
```

---

### Task 8: `RsvpForm` client component

**Files:**
- Create: `apps/blackberry/src/components/rsvp-form.tsx`
- Create: `apps/blackberry/src/components/rsvp-form.test.tsx`
- Modify: `apps/blackberry/package.json` (via `pnpm add`)

**Interfaces:**
- Consumes: `Form`, `FormControl`, `FormField`, `FormItem`, `FormLabel`, `FormMessage`, `Input`, `Textarea`, `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`, `Checkbox`, `RadioGroup`, `RadioGroupItem`, `Button` — all from `@mocha/ui` (Tasks 2–6, plus the existing `Button`). `EVENT_OPTIONS`, `GUEST_COUNT_OPTIONS`, `LODGING_OPTIONS`, `MEAL_OPTIONS`, `rsvpFormSchema`, `RsvpFormValues` from `./rsvp-schema` (Task 7).
- Produces: `RsvpForm` (no props) — consumed by `rsvp-section.tsx` in Task 9.

- [ ] **Step 1: Install react-hook-form, the Zod resolver, and the interaction-testing helper**

```bash
pnpm --filter @mocha/blackberry add react-hook-form @hookform/resolvers
pnpm --filter @mocha/blackberry add -D @testing-library/user-event
```

- [ ] **Step 2: Write the failing tests**

`apps/blackberry/src/components/rsvp-form.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { RsvpForm } from "./rsvp-form";

async function fillRequiredContactFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Jordan & Alex Rivera"), "Taylor Guest");
  await user.type(screen.getByPlaceholderText("you@email.com"), "taylor@example.com");
}

async function fillRequiredAttendingFields(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("combobox"));
  await user.click(await screen.findByRole("option", { name: "2" }));
  await user.click(screen.getByRole("checkbox", { name: "Friday Welcome Party" }));
  await user.click(screen.getByRole("radio", { name: "Herb-Roasted Chicken" }));
  await user.click(screen.getByRole("radio", { name: "I'll make my own arrangements" }));
}

describe("RsvpForm", () => {
  it("reveals the conditional fields only when attending is yes", async () => {
    const user = userEvent.setup();
    render(<RsvpForm />);

    expect(screen.queryByText("Number of guests")).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Joyfully accepts" }));
    expect(screen.getByText("Number of guests")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Regretfully declines" }));
    expect(screen.queryByText("Number of guests")).not.toBeInTheDocument();
  });

  it("blocks submission when attending yes without a meal preference, and shows no thank-you panel", async () => {
    const user = userEvent.setup();
    render(<RsvpForm />);

    await fillRequiredContactFields(user);
    await user.click(screen.getByRole("radio", { name: "Joyfully accepts" }));
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "2" }));
    await user.click(screen.getByRole("checkbox", { name: "Friday Welcome Party" }));
    await user.click(screen.getByRole("radio", { name: "I'll make my own arrangements" }));

    await user.click(screen.getByRole("button", { name: "Send RSVP" }));

    expect(await screen.findByText("Please select a meal preference.")).toBeInTheDocument();
    expect(screen.queryByText("We've got your RSVP.")).not.toBeInTheDocument();
  });

  it("shows the celebrate message on a valid attending-yes submission", async () => {
    const user = userEvent.setup();
    render(<RsvpForm />);

    await fillRequiredContactFields(user);
    await user.click(screen.getByRole("radio", { name: "Joyfully accepts" }));
    await fillRequiredAttendingFields(user);

    await user.click(screen.getByRole("button", { name: "Send RSVP" }));

    expect(await screen.findByText("We can't wait to celebrate with you!")).toBeInTheDocument();
  });

  it("shows the miss-you message on a valid attending-no submission, without requiring conditional fields", async () => {
    const user = userEvent.setup();
    render(<RsvpForm />);

    await fillRequiredContactFields(user);
    await user.click(screen.getByRole("radio", { name: "Regretfully declines" }));

    await user.click(screen.getByRole("button", { name: "Send RSVP" }));

    expect(
      await screen.findByText("We'll miss you — thank you for letting us know."),
    ).toBeInTheDocument();
  });

  it("returns to the form with prior values intact when editing the response", async () => {
    const user = userEvent.setup();
    render(<RsvpForm />);

    await fillRequiredContactFields(user);
    await user.click(screen.getByRole("radio", { name: "Regretfully declines" }));
    await user.click(screen.getByRole("button", { name: "Send RSVP" }));

    await user.click(await screen.findByRole("button", { name: "Edit response" }));

    expect(screen.getByPlaceholderText("Jordan & Alex Rivera")).toHaveValue("Taylor Guest");
    expect(screen.getByPlaceholderText("you@email.com")).toHaveValue("taylor@example.com");
    expect(screen.getByRole("radio", { name: "Regretfully declines" })).toHaveAttribute(
      "data-state",
      "checked",
    );
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm --filter @mocha/blackberry exec vitest run src/components/rsvp-form.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement `RsvpForm`**

`apps/blackberry/src/components/rsvp-form.tsx`:
```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@mocha/ui";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  EVENT_OPTIONS,
  GUEST_COUNT_OPTIONS,
  LODGING_OPTIONS,
  MEAL_OPTIONS,
  rsvpFormSchema,
  type RsvpFormValues,
} from "./rsvp-schema";

const DEFAULT_VALUES = {
  fullName: "",
  email: "",
  attending: undefined,
  guestCount: undefined,
  events: [],
  mealPreference: undefined,
  dietaryRestrictions: "",
  lodgingPreference: undefined,
  songRequest: "",
  message: "",
} satisfies Partial<RsvpFormValues>;

export function RsvpForm() {
  const [submitted, setSubmitted] = useState<"yes" | "no" | null>(null);
  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  if (submitted) {
    return (
      <div className="rounded-2xl bg-surface p-10 text-center">
        <p className="font-script text-4xl text-primary">Thank you!</p>
        <p className="mt-4 text-sm text-foreground">We&apos;ve got your RSVP.</p>
        <p className="mt-2 text-sm text-muted">
          {submitted === "yes"
            ? "We can't wait to celebrate with you!"
            : "We'll miss you — thank you for letting us know."}
        </p>
        <Button type="button" variant="outline" className="mt-8" onClick={() => setSubmitted(null)}>
          Edit response
        </Button>
      </div>
    );
  }

  const attending = form.watch("attending");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => setSubmitted(values.attending))}
        className="flex flex-col gap-6 rounded-2xl bg-surface p-10"
      >
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-bb-clay">Full name(s)</FormLabel>
              <FormControl>
                <Input placeholder="Jordan & Alex Rivera" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-bb-clay">Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attending"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-bb-clay">Will you be attending?</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value}>
                  <RadioGroupItem value="yes">Joyfully accepts</RadioGroupItem>
                  <RadioGroupItem value="no">Regretfully declines</RadioGroupItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {attending === "yes" && (
          <>
            <FormField
              control={form.control}
              name="guestCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-bb-clay">Number of guests</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a number" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GUEST_COUNT_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="events"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-bb-clay">Which events will you join?</FormLabel>
                  <div className="flex flex-col gap-3">
                    {EVENT_OPTIONS.map((option) => {
                      const checked = field.value?.includes(option) ?? false;
                      return (
                        <label key={option} className="flex items-center gap-3 text-sm text-foreground">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(next) => {
                              const current = field.value ?? [];
                              field.onChange(
                                next === true
                                  ? [...current, option]
                                  : current.filter((item) => item !== option),
                              );
                            }}
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mealPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-bb-clay">Meal preference</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      {MEAL_OPTIONS.map((option) => (
                        <RadioGroupItem key={option} value={option}>
                          {option}
                        </RadioGroupItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-bb-clay">Dietary restrictions or allergies</FormLabel>
                  <FormControl>
                    <Input placeholder="Nut allergy, gluten-free, none…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lodgingPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-bb-clay">Lodging preference</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      {LODGING_OPTIONS.map((option) => (
                        <RadioGroupItem key={option.value} value={option.value}>
                          {option.label}
                        </RadioGroupItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="songRequest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-bb-clay">Song request</FormLabel>
                  <FormControl>
                    <Input placeholder="Artist – Song" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-bb-clay">A note for the couple (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Can't wait to celebrate with you both!" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="self-start">
          Send RSVP
        </Button>
      </form>
    </Form>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm --filter @mocha/blackberry exec vitest run src/components/rsvp-form.test.tsx`
Expected: PASS (all 5 cases)

- [ ] **Step 6: Run the full blackberry suite and typecheck**

Run: `pnpm --filter @mocha/blackberry test && pnpm --filter @mocha/blackberry typecheck`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add apps/blackberry/src/components/rsvp-form.tsx apps/blackberry/src/components/rsvp-form.test.tsx \
  apps/blackberry/package.json pnpm-lock.yaml
git commit -m "feat(blackberry): add the RSVP form with conditional validation"
```

---

### Task 9: `RsvpSection` server component

**Files:**
- Create: `apps/blackberry/src/components/rsvp-section.tsx`
- Create: `apps/blackberry/src/components/rsvp-section.test.tsx`

**Interfaces:**
- Consumes: `Reveal` from `@mocha/ui` (existing, Session 1); `RsvpForm` from `./rsvp-form` (Task 8).
- Produces: `RsvpSection` (no props) — consumed by `page.tsx` in Task 10.

- [ ] **Step 1: Write the failing test**

`apps/blackberry/src/components/rsvp-section.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RsvpSection } from "./rsvp-section";

describe("RsvpSection", () => {
  it("renders the static copy and composes the RSVP form", () => {
    render(<RsvpSection />);

    expect(screen.getByRole("heading", { level: 2, name: "RSVP" })).toBeInTheDocument();
    expect(screen.getByText("will you join us?")).toBeInTheDocument();
    expect(screen.getByText(/Kindly respond by/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Jordan & Alex Rivera")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @mocha/blackberry exec vitest run src/components/rsvp-section.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `RsvpSection`**

`apps/blackberry/src/components/rsvp-section.tsx`:
```tsx
import { Reveal } from "@mocha/ui";

import { RsvpForm } from "./rsvp-form";

export function RsvpSection() {
  return (
    <section id="rsvp" className="bg-bb-clay px-6 py-24 sm:px-12">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="font-script text-3xl text-white">will you join us?</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-2 font-serif text-5xl text-white sm:text-6xl">RSVP</h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 text-sm text-white/80">
            Kindly respond by <strong className="font-medium">August 1, 2027</strong>. One form
            per household — add each guest below.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-12 max-w-2xl">
        <RsvpForm />
      </div>
    </section>
  );
}
```

No `"use client"` here — matching the `Hero` precedent (Session 1): the section itself needs no client boundary of its own; its only interactivity lives in the client `Reveal` and `RsvpForm` children it renders.

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm --filter @mocha/blackberry exec vitest run src/components/rsvp-section.test.tsx`
Expected: PASS

- [ ] **Step 5: Run the full blackberry suite and typecheck**

Run: `pnpm --filter @mocha/blackberry test && pnpm --filter @mocha/blackberry typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/blackberry/src/components/rsvp-section.tsx apps/blackberry/src/components/rsvp-section.test.tsx
git commit -m "feat(blackberry): add the RSVP section wrapper"
```

---

### Task 10: Compose `RsvpSection` into `page.tsx`

**Files:**
- Modify: `apps/blackberry/src/app/page.tsx`

**Interfaces:**
- Consumes: `RsvpSection` from `./components/rsvp-section` (Task 9).

- [ ] **Step 1: Add the import**

In `apps/blackberry/src/app/page.tsx`, change:
```tsx
import { CountdownStrip, Hero, SiteFooter, SiteNav } from "@mocha/ui";

import heroPhoto from "@/assets/hero.jpeg";
```
to:
```tsx
import { CountdownStrip, Hero, SiteFooter, SiteNav } from "@mocha/ui";

import heroPhoto from "@/assets/hero.jpeg";
import { RsvpSection } from "@/components/rsvp-section";
```

- [ ] **Step 2: Replace the placeholder comment with the real composition**

Change:
```tsx
        {/*
          Sessions 2–5 add their sections here, in this order:
          Schedule of Events, Wedding Party, Travel & Directions, Accommodations (Stay),
          Explore, Details, FAQ, RSVP.
        */}
      </main>
```
to:
```tsx
        {/*
          Sessions 2-4 still add their sections here, in this order:
          Schedule of Events, Wedding Party, Travel & Directions, Accommodations (Stay),
          Explore, Details, FAQ. RSVP (Session 5) is composed below.
        */}

        <RsvpSection />
      </main>
```

- [ ] **Step 3: Verify the app builds and typechecks**

Run: `pnpm --filter @mocha/blackberry typecheck && pnpm --filter @mocha/blackberry build`
Expected: PASS — no dedicated test for `page.tsx` exists (matches the existing convention: `Hero`/`CountdownStrip`/`SiteFooter` are unit-tested individually, not through a page-level test), so a clean typecheck + production build is this task's pass condition.

- [ ] **Step 4: Commit**

```bash
git add apps/blackberry/src/app/page.tsx
git commit -m "feat(blackberry): compose the RSVP section before the footer"
```

---

### Task 11: Full repository verification

**Files:** none (verification only)

- [ ] **Step 1: Run every root verification command**

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: all four PASS, with no stale/partial output relied upon — re-run any command whose output looks truncated or ambiguous.

- [ ] **Step 2: Confirm the conditional-required Zod rules are actually covered**

Re-read `apps/blackberry/src/components/rsvp-schema.test.ts` and `apps/blackberry/src/components/rsvp-form.test.tsx` output from Step 1's `pnpm test` run. Confirm by name that these cases passed:
- `rsvpFormSchema > fails when attending without a meal preference`
- `rsvpFormSchema > fails when attending without a guest count, events, or lodging preference`
- `rsvpFormSchema > succeeds when declining, without any conditional fields`
- `RsvpForm > blocks submission when attending yes without a meal preference, and shows no thank-you panel`

If any of these test names are missing or failing, stop and fix before proceeding — this is the specific coverage the spec's acceptance criteria call out by name.

- [ ] **Step 3: Report status**

Do not proceed to `superpowers:requesting-code-review` (next step, outside this plan) until every command in Step 1 is independently confirmed passing from a fresh run in this session.

---

## Self-Review Notes

- **Spec coverage:** every field in the spec's Field-list table (Task 8), the conditional Zod policy (Task 7), the `--site-destructive` token (Task 1), the component-split decision (Tasks 2–6 vs. 7–9), the thank-you/edit-response flow (Task 8), and the `page.tsx` composition point (Task 10) each map to a task above.
- **Placeholder scan:** no `TBD`/`TODO`; every step has literal, complete code.
- **Type consistency check performed:** `RsvpFormValues`, `rsvpFormSchema`, `EVENT_OPTIONS`, `MEAL_OPTIONS`, `GUEST_COUNT_OPTIONS`, `LODGING_OPTIONS` (Task 7) match their usage in Task 8 exactly by name. `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage` (Task 6), `Input`/`Textarea` (Task 2), `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue` (Task 3), `Checkbox` (Task 4), `RadioGroup`/`RadioGroupItem` (Task 5) all match their Task 8 import list by name.
