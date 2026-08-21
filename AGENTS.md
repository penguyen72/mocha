# Repository Agent Instructions

## Scope

This pnpm/Turborepo contains two independently deployed Next.js applications:

- `apps/canton`: family wedding site
- `apps/blackberry`: friends wedding site

Shared packages live in `packages/`. Read the approved design and current implementation plan under `docs/superpowers/` before architectural work.

## Required workflow

Use relevant Superpowers skills when they are available:

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
- Do not regenerate either application with `create-next-app`.
- Default to Server Components and keep client boundaries narrow.
- Keep Canton-specific copy and composition in `apps/canton`.
- Keep Blackberry-specific copy and composition in `apps/blackberry`.
- Add to `@mocha/ui` only when both applications intentionally share the visual API.
- Do not introduce runtime microfrontend machinery, storage, authentication, analytics, or a CMS without an approved design.
- shadcn/ui is approved and lives in `packages/ui` (see `docs/superpowers/specs/2026-08-19-blackberry-wedding-foundation-design.md`), hand-authored to this repo's `--site-*` token convention rather than shadcn's own default scaffold. Add components there with `pnpm dlx shadcn@latest add <component>` only when an approved design actually needs them — don't pre-install unused components.
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
