# Save the Date Address Submission Design

**Date:** 2026-09-23
**Status:** Approved in conversation
**Depends on:** `docs/superpowers/specs/2026-09-23-save-the-date-design.md` (merged as #8)

## Purpose

`apps/save-the-date`'s address form currently tells a guest "Your address has been received" and
then discards the submission. `submitAddress` waits 1400ms and resolves; nothing is stored or sent.

For a page whose entire purpose is collecting mailing addresses, that is worse than incomplete —
it is misleading. A guest who submits believes they are done. This spec wires the form to a real
destination so that belief becomes true.

## Scope

**In scope:** `apps/save-the-date`'s address form submits to a hosted form service, with real
success and failure states. Documentation for configuring it.

**Out of scope:**

- `apps/blackberry`'s RSVP form, which has the identical gap. Its own spec
  (`2026-08-21-blackberry-wedding-rsvp-design.md`) deliberately deferred persistence, and it stays
  deferred. This spec establishes the pattern that work can follow in its own PR — three text
  fields is a better place to prove it than the RSVP's ten mixed fields with conditional
  validation.
- Any shared submission helper. Both apps can post to their own form independently with no shared
  code. Extract one only if a second consumer actually appears.
- Reading submissions back into the app, an admin view, or de-duplication.

## The `AGENTS.md` boundary this crosses

Root `AGENTS.md` says:

> Do not introduce runtime microfrontend machinery, storage, authentication, analytics, or a CMS
> without an approved design.

**This document is that approved design**, for exactly one thing: `apps/save-the-date` posting its
address form to a hosted form service. It does not authorise storage, auth, analytics, a CMS, or a
submission endpoint in any other app. `AGENTS.md` gains a line pointing here so a future session
reading that boundary does not mistake this for a violation.

## Decision: a hosted form service, posted to directly from the browser

The browser `POST`s straight to Formspree. No route handler, no server action, no server code at
all — `apps/save-the-date` stays fully statically prerendered, exactly as it is today.

### Why not proxy through a Route Handler

Considered and rejected. A proxy would hide the endpoint from client code, but that hiding is
illusory: the proxy is itself a public unauthenticated endpoint, so anyone who would have posted
junk to Formspree can post it to us instead. It would make this the first server-side code in the
monorepo, and it buys nothing — Formspree already runs server-side spam filtering, and the
endpoint is inherently public because the browser has to know it.

A proxy earns its place when there is a real secret to protect, or rate limits that cannot be had
otherwise. Neither applies here.

### Why a form service rather than email, a sheet, or a database

The end goal is not "store the data" — it is "print address labels." A service that emails on each
submission *and* offers CSV export reaches that goal with the least machinery. Emailing to an inbox
makes the inbox the database, which is tedious to collate. A real database is more infrastructure
and secret management than a one-time guest list justifies.

**Privacy, stated explicitly:** guest mailing addresses are personal data, and this design hands
them to a third party under Formspree's terms. That is a deliberate, accepted trade, not a side
effect of picking the easiest integration.

## The Formspree contract

Verified against Formspree's own published client, `@formspree/core@4.0.0`
(`dist/index.mjs`), rather than from documentation or memory — their help-centre pages do not
state the raw contract, and it differs from what the obvious implementation would assume.

**Request**

| Part | Value |
| --- | --- |
| URL | `https://formspree.io/f/{formId}` |
| Method | `POST` |
| Mode | `cors` |
| `Accept` | `application/json` (always) |
| `Content-Type` | `application/json` (set whenever the body is not `FormData`) |
| Body | `JSON.stringify(payload)` |

The client also sends `Formspree-Client` and `Formspree-Session-Data` headers. Those are their own
telemetry, not required by the API, and this port does not send them.

**Response — the part that matters**

Formspree reports failure **in the JSON body, not only through the HTTP status.** Their client
never inspects `response.ok`; it parses the body and tests its shape:

```js
function w(e) {
  return "errors" in e && Array.isArray(e.errors) && e.errors.every(r => typeof r.message == "string")
      || "error" in e && typeof e.error == "string";
}
```

| Outcome | Body shape |
| --- | --- |
| Success | `{ next: string }` |
| Field/form errors | `{ errors: [{ message: string, code?: string, field?: string }] }` |
| Single error | `{ error: string }` |

**This is the single most important detail in this spec.** A `if (!response.ok) throw` implementation
would swallow an error-shaped 200 response and report success to the guest — reintroducing exactly
the bug this work exists to fix. Submission must therefore treat **either** a non-2xx status **or**
an error-shaped body as failure.

`_subject`, `_replyto` and `_gotcha` are historically documented Formspree conventions but do not
appear in the client source, so they could not be verified. None are used.

## Architecture

### Only `address-submit.ts` changes

The seam built in #8 already has the right signature, so the form needs no changes at all:

```ts
export async function submitAddress(values: AddressFormValues): Promise<void>;
```

`address-form.tsx`'s `idle → sending → success | error` machine, its `role="alert"`, its disabled
button, its focus move to the success heading, and retry-by-pressing-again all already work
against that contract. That this change is absorbed entirely by one module is the evidence the
seam was drawn in the right place.

`SUBMIT_DELAY_MS` and the artificial 1400ms wait are deleted. Real network latency replaces them,
which makes the "Sending…" state honest rather than theatrical.

### Configuration

The endpoint comes from `NEXT_PUBLIC_FORMSPREE_ENDPOINT`, read as
`process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT`. Next inlines `NEXT_PUBLIC_*` at build time, so an
unset variable inlines as `undefined` and the guard below still fires in production.

**It must be read inside `submitAddress`, not at module scope.** A module-scope
`const ENDPOINT = process.env.…` is evaluated once at import, which `vi.stubEnv` cannot change
afterwards — the "endpoint unset" test would be unwritable. Next inlines `NEXT_PUBLIC_*` wherever
it appears, function bodies included, so reading it per call costs nothing in production.

It is not a secret — the browser must know it — but an env var rather than a hardcoded string
means previews and local development can point somewhere harmless, and keeps a spam-magnet
identifier out of a public repository.

**If it is unset, submission fails into the existing error state.** It must never fall back to the
simulated success it is replacing: that would recreate the original bug, telling a guest
"received" when nothing was received. Failing loudly is the correct behaviour for a
misconfiguration.

### Payload

```json
{ "name": "…", "email": "…", "address": "…" }
```

The parsed, trimmed values straight from the Zod schema, under the same keys the form uses.
Formspree is widely documented as treating a field named `email` as the submission's reply-to
address; that behaviour is not visible in the client source and is therefore **unverified**. The
key is named `email` because that is the field's name, not because the design depends on the
reply-to behaviour.

### Failure handling

Four failure modes, one guest-facing message:

| Mode | Detection |
| --- | --- |
| Endpoint not configured | `NEXT_PUBLIC_FORMSPREE_ENDPOINT` is unset or empty |
| Request never completed | `fetch` rejects |
| Rejected by Formspree | non-2xx status, **or** an error-shaped body |
| Unreadable response | body is not JSON |

All four surface as the existing *"We couldn't send your address. Please try again."* in a
`role="alert"`. A guest cannot act on the difference between them, so distinguishing them in the UI
would be noise — but each logs a distinct `console.error`, because the site owner can act on the
difference. Formspree's own error messages are logged, never shown: they are written for a
developer, not a wedding guest.

Retry needs no new code. The error state leaves the form filled with the button re-enabled, so
retry is "press it again," already covered by an existing test.

## Two deliberate omissions

**No honeypot field.** Formspree runs server-side spam filtering. Threading a fake `_gotcha` field
through a React-controlled form with a Zod schema costs more than it buys, and `_gotcha` could not
be verified in the client source. Easy to add if spam actually materialises.

**No retry or backoff logic.** A wedding guest submitting one address does not need it, and manual
retry already works.

## Testing

New `address-submit.test.ts`, with `fetch` stubbed via `vi.stubGlobal` and the env var via
`vi.stubEnv`:

| Case | Asserts |
| --- | --- |
| Happy path | `POST` to the configured endpoint, `mode: "cors"`, both headers, and the exact JSON body |
| Success response | resolves on `{ next: "…" }` with a 200 |
| Endpoint unset | throws, and never calls `fetch` |
| Error-shaped body with a 200 | **throws** — the regression guard for the contract detail above |
| `{ error: "…" }` body | throws |
| Non-2xx status | throws |
| `fetch` rejects | throws |
| Body is not JSON | throws |

`address-form.test.tsx` is untouched and stays valid — it mocks the module. Its existing "shows the
error alert when the submission rejects" case stops being a somewhat artificial exercise and starts
covering a genuinely reachable production path.

## Documentation

- `apps/save-the-date/README.md`: the "does not submit anywhere" gap becomes setup instructions —
  create the Formspree form, set `NEXT_PUBLIC_FORMSPREE_ENDPOINT` in Vercel for Production and
  Preview, and how to point it somewhere harmless for local development.
- Root `README.md`: the Vercel deployment section notes the variable for the Save the Date project.
- Root `AGENTS.md`: a line recording that this form service is approved per this spec, so the
  "no form services without an approved design" boundary is not misread as violated.
- No `.env.example`. `apps/save-the-date/.gitignore` ignores `.env*`, and the root's
  `!.env.example` negation does not reach into the app directory. Documenting the variable in the
  README avoids fighting that for no benefit.

## Handoff — what only the site owner can do

1. Create a Formspree form and copy its hash id.
2. Set `NEXT_PUBLIC_FORMSPREE_ENDPOINT` to `https://formspree.io/f/<hash id>` in the Vercel project
   for Production and Preview.
3. Submit the live form once and confirm the address arrives, both as an email and in the Formspree
   dashboard. **Until that test submission is confirmed, treat the form as unwired** — the code
   cannot verify that a real form id points at a real inbox.
