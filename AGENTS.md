# Repository Agent Instructions

## Scope

This pnpm/Turborepo contains three independently deployed Next.js applications:

- `apps/canton`: family wedding site
- `apps/blackberry`: friends wedding site
- `apps/save-the-date`: save-the-date card

Shared packages live in `packages/`. Read the approved design and current implementation plan under `docs/superpowers/` before architectural work.

## Required workflow

Never push or commit directly to `main`. Every change — docs included — lands through a pull
request on its own branch, reviewed and merged through GitHub. When using the branch-finishing
workflow, always choose "push and create a pull request"; never "merge locally," and never push
`main` directly under any circumstance.

This repo accepts two paths, chosen by scope. If in doubt which one applies, treat the change as
Superpowers-worthy.

**Direct PR** — for small, well-scoped changes: docs, config or tooling fixes, dependency bumps,
backfilling tests for existing behavior, small bug fixes with an obvious, already-understood root
cause. Branch, make the change, verify it, open a PR. The full brainstorm/plan ceremony below
isn't required, but still verify before opening the PR and still request review.

**Superpowers workflow** — for anything creative, behavioral, or architectural: new features, new
components or page sections, new business logic, or any change that involves a design decision a
human should weigh in on. Use the relevant Superpowers skills:

1. Brainstorm and obtain approval before creative, behavioral, or architectural changes.
2. Write a plan for approved multi-step work.
3. Use test-driven development for behavior.
4. Use systematic debugging for failures.
5. Verify before claiming completion.
6. Request code review before merge.
7. Use the branch-finishing workflow for pull-request handoff.

Direct user instructions override this workflow.

## Boundaries

- Use pnpm; do not add npm or Yarn lockfiles.
- Do not regenerate any application with `create-next-app`.
- Default to Server Components and keep client boundaries narrow.
- Keep Canton-specific copy and composition in `apps/canton`.
- Keep Blackberry-specific copy and composition in `apps/blackberry`.
- Keep Save the Date-specific copy and composition in `apps/save-the-date`.
- Add to `@mocha/ui` only when more than one application intentionally shares the visual API.
- Do not introduce runtime microfrontend machinery, storage, authentication, analytics, or a CMS without an approved design.
- shadcn/ui is approved and lives in `packages/ui` (see `docs/superpowers/specs/2026-08-19-blackberry-wedding-foundation-design.md`), hand-authored to this repo's `--site-*` token convention rather than shadcn's own default scaffold. Add components there with `pnpm dlx shadcn@latest add <component>` only when an approved design actually needs them — don't pre-install unused components. shadcn's CLI emits `@/`-prefixed imports (e.g. `@/lib/utils`); convert them to relative paths before committing, since `packages/ui` ships raw source and consuming apps resolve `@/*` against their own `src`, not this package's.
- Preserve framework guidance in any app-local `AGENTS.md`; within an app, compatible app-local instructions are more specific than this file.

## Verification

Run the checks relevant to the files changed during development. Before completion, run from the repository root:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Do not claim success from stale or partial command output.
