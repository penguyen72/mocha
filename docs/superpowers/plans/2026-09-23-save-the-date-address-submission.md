# Save the Date Address Submission Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `apps/save-the-date`'s address form actually deliver submissions, by posting them to
a Formspree form from the browser.

**Architecture:** `submitAddress` in `address-submit.ts` — the seam built for exactly this in PR #8 —
becomes a real `fetch` to `https://formspree.io/f/{id}`. Its signature does not change, so
`address-form.tsx` is untouched: its `idle → sending → success | error` machine already handles
every outcome. No route handler, no server action; the app stays statically prerendered.

**Tech Stack:** Next.js 16.3.1, React 19.2.8, `fetch`, Vitest 4.1.11, Formspree.

## Global Constraints

Every task's requirements implicitly include this section.

- **Approved design:** `docs/superpowers/specs/2026-09-23-save-the-date-address-submission-design.md`.
  Read it before starting; the Formspree contract section is load-bearing.
- **Never commit or push to `main`.** All work lands on `feat/save-the-date-address-submission`.
- **`address-form.tsx` must not change.** If it needs to, the seam was wrong and that is a finding
  to report, not a change to make quietly.
- **Never fall back to simulated success.** A missing endpoint, a failed request, or a rejected
  submission must all surface as the error state. Reporting success when nothing was sent is the
  exact bug this work exists to remove.
- **Failure is signalled in the response body, not only the HTTP status.** Verified against
  `@formspree/core@4.0.0`: their own client never checks `response.ok`, it tests the parsed body
  for `{ errors: [{ message }] }` or `{ error: string }`. Treat a non-2xx status **or** an
  error-shaped body as failure.
- **Read the endpoint inside `submitAddress`, never at module scope.** A module-scope read is
  frozen at import and cannot be stubbed by `vi.stubEnv`, which would make the "endpoint unset"
  test unwritable. Next inlines `NEXT_PUBLIC_*` inside function bodies too, so this is free.
- **Formspree's own error messages are logged, never rendered.** They are written for developers.
  The guest always sees the existing `ADDRESS_SUBMIT_ERROR` copy.
- **No new dependency.** Plain `fetch`; do not add `@formspree/react` or `@formspree/core`.
- **No honeypot field and no retry/backoff logic** — both deliberately out of scope per the spec.
- **pnpm only.** Do not touch `apps/canton`, `apps/blackberry`, or `packages/`.
- **Commit after every task.** End every commit message with:

  ```
  Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_018mP2WQSjAs6bLLAkW58pkp
  ```

## File Structure

```
apps/save-the-date/src/components/
  address-submit.ts             REWRITTEN — real fetch, endpoint guard, body-shape error check
  address-submit.test.ts        NEW — 8 cases, fetch and env both stubbed
  address-form.test.tsx         MODIFIED — one line: drop SUBMIT_DELAY_MS from the module mock
apps/save-the-date/README.md    MODIFIED — the "submits nowhere" gap becomes setup instructions
README.md                       MODIFIED — Vercel section gains the env var
AGENTS.md                       MODIFIED — records that this form service is approved
```

`address-form.tsx` appears nowhere in that list, deliberately.

## Tasks at a glance

| # | Deliverable |
| --- | --- |
| 1 | `submitAddress` really posts to Formspree, with all eight outcomes tested |
| 2 | Docs: app README setup instructions, root README env var, `AGENTS.md` approval line |
| 3 | Full verification and PR |

---

### Task 1: Post the submission to Formspree

**Files:**
- Create: `apps/save-the-date/src/components/address-submit.test.ts`
- Rewrite: `apps/save-the-date/src/components/address-submit.ts`
- Modify: `apps/save-the-date/src/components/address-form.test.tsx` (one line)

**Interfaces:**
- Consumes: `type AddressFormValues = { name: string; email: string; address: string }` from
  `./address-schema`.
- Produces: `submitAddress(values: AddressFormValues): Promise<void>` — resolves when Formspree
  accepted the submission, throws otherwise. **Unchanged from the current signature**, which is why
  `address-form.tsx` needs no edit. `SUBMIT_DELAY_MS` is removed.

- [ ] **Step 1: Write the failing test**

`apps/save-the-date/src/components/address-submit.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { submitAddress } from "./address-submit";

const ENDPOINT_ENV = "NEXT_PUBLIC_FORMSPREE_ENDPOINT";
const ENDPOINT = "https://formspree.io/f/abcdefgh";

const VALUES = {
  name: "Jordan Avery",
  email: "jordan@example.com",
  address: "1428 Magnolia Lane, Apt 3B\nChattanooga, TN 37402\nUnited States",
};

/** A minimal stand-in for the parts of Response that submitAddress actually reads. */
function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function stubFetch(implementation: () => Promise<Response>) {
  const fetchMock = vi.fn(implementation);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("submitAddress", () => {
  beforeEach(() => {
    vi.stubEnv(ENDPOINT_ENV, ENDPOINT);
    // submitAddress logs the real cause for the site owner; keep test output readable.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("posts the submission to the configured endpoint as JSON", async () => {
    const fetchMock = stubFetch(async () => jsonResponse({ next: "https://formspree.io/thanks" }));

    await expect(submitAddress(VALUES)).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(ENDPOINT);
    expect(init.method).toBe("POST");
    expect(init.mode).toBe("cors");
    expect(init.headers).toEqual({
      Accept: "application/json",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(init.body))).toEqual({
      name: VALUES.name,
      email: VALUES.email,
      address: VALUES.address,
    });
  });

  it("throws without calling fetch when the endpoint is not configured", async () => {
    vi.stubEnv(ENDPOINT_ENV, "");
    const fetchMock = stubFetch(async () => jsonResponse({ next: "ok" }));

    await expect(submitAddress(VALUES)).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // The contract detail that matters most: Formspree reports validation failures in the
  // body, with a 200. Checking response.ok alone would report success to the guest.
  it("throws when an error-shaped body arrives with a 200", async () => {
    stubFetch(async () =>
      jsonResponse({
        errors: [{ message: "Email is required", code: "REQUIRED_FIELD_EMPTY", field: "email" }],
      }),
    );

    await expect(submitAddress(VALUES)).rejects.toThrow();
  });

  it("throws on a single-error body", async () => {
    stubFetch(async () => jsonResponse({ error: "Form not found" }));

    await expect(submitAddress(VALUES)).rejects.toThrow();
  });

  it("throws on a non-2xx status", async () => {
    stubFetch(async () => jsonResponse({ next: "ok" }, 500));

    await expect(submitAddress(VALUES)).rejects.toThrow();
  });

  it("throws when the request never completes", async () => {
    stubFetch(async () => {
      throw new TypeError("Failed to fetch");
    });

    await expect(submitAddress(VALUES)).rejects.toThrow();
  });

  it("throws when the response body is not JSON", async () => {
    stubFetch(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => {
            throw new SyntaxError("Unexpected token < in JSON");
          },
        }) as unknown as Response,
    );

    await expect(submitAddress(VALUES)).rejects.toThrow();
  });

  it("ignores a body whose errors array is not Formspree-shaped", async () => {
    // A 200 with an unrelated `errors` key that does not match Formspree's predicate
    // is not a submission failure; only `{ message: string }` entries count.
    stubFetch(async () => jsonResponse({ next: "ok", errors: [42] }));

    await expect(submitAddress(VALUES)).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd /Users/peynguyen/Repositories/mocha && pnpm --filter @mocha/save-the-date test address-submit
```

Expected: FAIL. The current `submitAddress` never calls `fetch`, so the first test fails on
`expected "spy" to be called 1 times, but got 0 times`, and every `rejects.toThrow()` case fails
because the current implementation always resolves.

- [ ] **Step 3: Rewrite `address-submit.ts`**

```ts
import type { AddressFormValues } from "./address-schema";

const ENDPOINT_ENV = "NEXT_PUBLIC_FORMSPREE_ENDPOINT";

/**
 * Formspree reports failures in the response body rather than only through the HTTP
 * status — its own client (@formspree/core@4.0.0) never inspects `response.ok`. This
 * mirrors that client's predicate: an `errors` array whose every entry has a string
 * `message`, or a single string `error`.
 *
 * Returns the messages when the body is a Formspree failure, or null when it is not.
 */
function readFormspreeErrors(body: unknown): string[] | null {
  if (body === null || typeof body !== "object") return null;

  if ("errors" in body) {
    const { errors } = body as { errors: unknown };
    const isFormspreeErrorList =
      Array.isArray(errors) &&
      errors.length > 0 &&
      errors.every(
        (entry) =>
          entry !== null &&
          typeof entry === "object" &&
          typeof (entry as { message?: unknown }).message === "string",
      );

    if (isFormspreeErrorList) {
      return (errors as { message: string }[]).map((entry) => entry.message);
    }
  }

  if ("error" in body) {
    const { error } = body as { error: unknown };
    if (typeof error === "string") return [error];
  }

  return null;
}

/**
 * Sends a guest's mailing address to the Formspree form configured by
 * NEXT_PUBLIC_FORMSPREE_ENDPOINT. Resolves only when Formspree accepted it; throws
 * otherwise, which is what drives the form's error state.
 *
 * Every failure path throws rather than resolving. Reporting success when nothing was
 * sent would tell a guest their address arrived when it did not.
 *
 * Formspree's own error text is logged for the site owner and never rendered — it is
 * written for a developer, not a wedding guest.
 */
export async function submitAddress(values: AddressFormValues): Promise<void> {
  // Read per call, not at module scope: a module-scope read is frozen at import and
  // cannot be stubbed in tests. Next inlines NEXT_PUBLIC_* inside function bodies too.
  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

  if (!endpoint) {
    console.error(
      `submitAddress: ${ENDPOINT_ENV} is not set, so the address was not sent. ` +
        "Set it to https://formspree.io/f/<form id> in the Vercel project.",
    );
    throw new Error(`${ENDPOINT_ENV} is not configured.`);
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        address: values.address,
      }),
    });
  } catch (cause) {
    console.error("submitAddress: the request to Formspree never completed.", cause);
    throw new Error("The address submission request failed.", { cause });
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (cause) {
    console.error(
      `submitAddress: Formspree returned a response that was not JSON (HTTP ${response.status}).`,
      cause,
    );
    throw new Error("The address submission response could not be read.", { cause });
  }

  const errors = readFormspreeErrors(body);

  if (!response.ok || errors !== null) {
    console.error(
      `submitAddress: Formspree rejected the submission (HTTP ${response.status}).`,
      errors ?? body,
    );
    throw new Error("Formspree rejected the address submission.");
  }
}
```

- [ ] **Step 4: Drop `SUBMIT_DELAY_MS` from the form test's module mock**

`SUBMIT_DELAY_MS` no longer exists. `address-form.tsx` never imported it, so nothing breaks either
way, but leaving it in the mock advertises an export that is gone.

In `apps/save-the-date/src/components/address-form.test.tsx`, change:

```ts
vi.mock("./address-submit", () => ({
  SUBMIT_DELAY_MS: 0,
  submitAddress: vi.fn(async () => {}),
}));
```

to:

```ts
vi.mock("./address-submit", () => ({
  submitAddress: vi.fn(async () => {}),
}));
```

Change nothing else in that file.

- [ ] **Step 5: Run the test to verify it passes**

```bash
cd /Users/peynguyen/Repositories/mocha && pnpm --filter @mocha/save-the-date test address
```

Expected: PASS — `address-submit.test.ts` 8 tests, `address-schema.test.ts` 5,
`address-form.test.tsx` 8, `address-section.test.tsx` 2.

- [ ] **Step 6: Prove the body-shape check is load-bearing**

The whole point of this task is that an ok status is not sufficient. Verify the test actually
catches a regression rather than passing by accident — temporarily weaken the check to a plain
status test:

```bash
cd /Users/peynguyen/Repositories/mocha
python3 - <<'PY'
p = "apps/save-the-date/src/components/address-submit.ts"
s = open(p).read()
open(p, "w").write(s.replace("if (!response.ok || errors !== null) {", "if (!response.ok) {"))
PY
pnpm --filter @mocha/save-the-date test address-submit
```

Expected: **FAIL**, with "throws when an error-shaped body arrives with a 200" and "throws on a
single-error body" both failing. If they pass, the tests are not testing what they claim and must
be fixed before continuing.

Restore it:

```bash
cd /Users/peynguyen/Repositories/mocha
python3 - <<'PY'
p = "apps/save-the-date/src/components/address-submit.ts"
s = open(p).read()
assert "if (!response.ok) {" in s
open(p, "w").write(s.replace("if (!response.ok) {", "if (!response.ok || errors !== null) {"))
PY
grep -n "response.ok" apps/save-the-date/src/components/address-submit.ts
pnpm --filter @mocha/save-the-date test address-submit
```

Expected: the grep shows `if (!response.ok || errors !== null) {` and the tests pass again.

- [ ] **Step 7: Confirm `address-form.tsx` is untouched**

```bash
cd /Users/peynguyen/Repositories/mocha && git diff --stat -- apps/save-the-date/src/components/address-form.tsx
```

Expected: no output. The seam absorbed the whole change. If this file did need editing, stop and
report it — it means the seam's contract was wrong, which is a design finding.

- [ ] **Step 8: Verify lint, types and build**

```bash
cd /Users/peynguyen/Repositories/mocha && pnpm --filter @mocha/save-the-date lint && pnpm --filter @mocha/save-the-date typecheck && pnpm --filter @mocha/save-the-date build
```

Expected: all three pass, and the build still reports `/` and `/share-your-address` as
`○ (Static)`. Adding a `fetch` inside a client component does not make either route dynamic; if
the build reports otherwise, something else changed.

- [ ] **Step 9: Commit**

```bash
cd /Users/peynguyen/Repositories/mocha
git add apps/save-the-date/src/components
git commit -m "$(cat <<'MSG'
feat(save-the-date): post address submissions to Formspree

Replaces the simulated 1400ms resolve with a real browser POST to
https://formspree.io/f/{id}. The seam's signature is unchanged, so address-form.tsx
needs no edit — its sending/success/error machine already handles every outcome.

Failure is detected from the response body as well as the status, because Formspree
reports validation errors in the body with a 200; their own client never checks
response.ok. Checking the status alone would tell a guest their address arrived when
it had not, which is the bug this change exists to remove. A missing endpoint fails
the same way rather than falling back to simulated success.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018mP2WQSjAs6bLLAkW58pkp
MSG
)"
```

---

### Task 2: Documentation

**Files:**
- Modify: `apps/save-the-date/README.md` (replace the form bullet under "Known gaps")
- Modify: `README.md` (repo root, Vercel deployment section)
- Modify: `AGENTS.md` (repo root, Boundaries section)

**Interfaces:**
- Consumes: Task 1's `NEXT_PUBLIC_FORMSPREE_ENDPOINT`.
- Produces: nothing code depends on.

- [ ] **Step 1: Replace the form gap in `apps/save-the-date/README.md`**

Find this bullet under "## Known gaps" and delete it entirely:

```markdown
- **The address form does not submit anywhere.** `src/components/address-submit.ts` is the single
  seam: it validates and resolves after a short delay, and the form's error state is driven by that
  promise rejecting. Wiring a real endpoint or form provider there makes the whole status machine
  live. Nothing is stored or sent today.
```

Then add this new section immediately **above** `## Known gaps`:

```markdown
## Address form submission

The address form posts to a [Formspree](https://formspree.io) form from the browser. There is no
server code and no secret: the endpoint is public by necessity, since the browser posts to it.

Set `NEXT_PUBLIC_FORMSPREE_ENDPOINT` to `https://formspree.io/f/<form id>`:

- **Vercel** — add it to the Save the Date project for both Production and Preview.
- **Locally** — put it in `apps/save-the-date/.env.local`, which is gitignored. Point it at a
  throwaway Formspree form rather than the real one, so development submissions do not land in
  the guest list.

If the variable is unset, submitting fails into the form's error state and logs the reason. That is
deliberate: falling back to a fake success would tell a guest their address arrived when nothing
was sent.

Failure is detected from the response body as well as the HTTP status, because Formspree reports
validation errors in the body with a `200` — its own client never checks `response.ok`. See
`src/components/address-submit.ts` and the design at
[`docs/superpowers/specs/2026-09-23-save-the-date-address-submission-design.md`](../../docs/superpowers/specs/2026-09-23-save-the-date-address-submission-design.md).

**Before relying on it, submit the live form once** and confirm the address arrives, as an email
and in the Formspree dashboard. No test can verify that a real form id points at a real inbox.
```

- [ ] **Step 2: Add the env var to the root `README.md`**

In the "## Vercel deployment" section, in the numbered list under "For each project:", replace
step 9:

```markdown
9. Configure any future environment variables separately for each project.
```

with:

```markdown
9. Configure environment variables separately for each project. Save the Date needs
   `NEXT_PUBLIC_FORMSPREE_ENDPOINT` set to `https://formspree.io/f/<form id>` for Production and
   Preview — without it, its address form fails into an error state by design. See
   [`apps/save-the-date/README.md`](apps/save-the-date/README.md).
```

- [ ] **Step 3: Record the approval in the root `AGENTS.md`**

In the "## Boundaries" section, find this line:

```markdown
- Do not introduce runtime microfrontend machinery, storage, authentication, analytics, or a CMS without an approved design.
```

and add this line directly beneath it:

```markdown
- A hosted form service is approved for `apps/save-the-date`'s address form only, per `docs/superpowers/specs/2026-09-23-save-the-date-address-submission-design.md`; it posts to Formspree from the browser and adds no server code. That approval does not extend to any other app or any other kind of storage — `apps/blackberry`'s RSVP form is still deliberately client-only.
```

- [ ] **Step 4: Check no stale claim survives**

```bash
cd /Users/peynguyen/Repositories/mocha && grep -rn "does not submit anywhere\|Nothing is stored or sent" README.md AGENTS.md apps/save-the-date/README.md
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
cd /Users/peynguyen/Repositories/mocha
git add README.md AGENTS.md apps/save-the-date/README.md
git commit -m "$(cat <<'MSG'
docs: document Formspree setup for the Save the Date address form

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018mP2WQSjAs6bLLAkW58pkp
MSG
)"
```

---

### Task 3: Verification and pull request

**Files:**
- Modify: none, unless verification finds a defect.

- [ ] **Step 1: Run every check from the repository root, cold**

```bash
cd /Users/peynguyen/Repositories/mocha
rm -rf .turbo apps/*/.turbo packages/*/.turbo
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Expected: all four pass. `@mocha/save-the-date` reports **10 test files, 39 tests** (31 before,
plus 8 new in `address-submit.test.ts`). Paste the real output; do not summarise a run that did not
happen.

- [ ] **Step 2: Confirm the blast radius**

```bash
cd /Users/peynguyen/Repositories/mocha && git diff --stat main...HEAD
```

Expected: exactly six files — `address-submit.ts`, `address-submit.test.ts`,
`address-form.test.tsx`, the two READMEs, `AGENTS.md`, plus the spec and plan docs. No change to
`address-form.tsx`, `apps/canton`, `apps/blackberry`, or `packages/`.

- [ ] **Step 3: Exercise the real failure path in a browser**

The happy path cannot be verified without a real Formspree form, but the failure path can — and it
is the path that matters, because it is the one that used to lie.

```bash
cd /Users/peynguyen/Repositories/mocha && pnpm --filter @mocha/save-the-date dev
```

With no `.env.local` set, open http://localhost:3002/share-your-address, fill the form and submit.
Confirm:

- The button reads "Sending…" briefly, then the form stays put.
- The error alert *"We couldn't send your address. Please try again."* appears.
- The console logs `submitAddress: NEXT_PUBLIC_FORMSPREE_ENDPOINT is not set…`.
- The success panel does **not** appear. This is the regression check that matters most: before
  this change, the same submission showed "Your address has been received."
- Pressing submit again retries, with the form still filled.

Then create `apps/save-the-date/.env.local` with a deliberately invalid endpoint:

```bash
echo 'NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/doesnotexist' > apps/save-the-date/.env.local
```

Restart the dev server, submit again, and confirm the error state appears again — this time from
Formspree's `{ error: "Form not found" }` body rather than from the missing variable. Then delete
the file:

```bash
rm apps/save-the-date/.env.local
```

Stop the dev server.

- [ ] **Step 4: Request code review**

Use `superpowers:requesting-code-review`. Address findings with
`superpowers:receiving-code-review`.

- [ ] **Step 5: Open the pull request**

Use `superpowers:finishing-a-development-branch` and choose **"push and create a pull request."**
Never merge locally; never push `main`.

The PR body must cover: what changed and why the seam absorbed it without touching the form; the
Formspree body-vs-status contract detail and that it was verified against `@formspree/core@4.0.0`
rather than documentation; that a missing endpoint fails rather than faking success; the real,
pasted output of all four gates; and the handoff steps only the site owner can do (create the form,
set the variable, submit a live test). End with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018mP2WQSjAs6bLLAkW58pkp
```

---

## Self-review

**Spec coverage.** Every section of the spec maps to a task: the direct-browser-POST decision and
the Formspree contract → Task 1 Step 3; reading the endpoint per call → Task 1 Step 3, guarded by
the "endpoint unset" test; the payload shape → Task 1 Step 1's body assertion; all four failure
modes → four of the eight tests; the two deliberate omissions (honeypot, retry) → Global
Constraints, with no task implementing them; the testing table → Task 1 Step 1 one-for-one, plus a
ninth case for a non-Formspree `errors` key; documentation → Task 2; the handoff → Task 2 Step 1
and Task 3 Step 5.

**Placeholder scan.** No TBD/TODO. Every code step carries complete code. Every doc edit quotes the
exact text to find and the exact text to write.

**Type consistency.** `submitAddress(values: AddressFormValues): Promise<void>` is used identically
in the spec, the test, the implementation, and the untouched `address-form.tsx`.
`readFormspreeErrors(body: unknown): string[] | null` is defined and used only inside
`address-submit.ts`. `AddressFormValues` comes from `./address-schema`, unchanged. `SUBMIT_DELAY_MS`
is removed in Step 3 and its last reference removed in Step 4 — no task references it afterwards.

**One risk worth naming.** Task 1 Step 1's `jsonResponse` helper casts a plain object to `Response`.
That is deliberate — `submitAddress` reads only `ok`, `status` and `json()` — but it means the test
would not catch a future implementation that started reading `response.headers` or `response.text()`.
If the implementation grows to need more of `Response`, the helper must grow with it.
