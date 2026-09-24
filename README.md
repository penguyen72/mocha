# Mocha

Mocha is Liane and Peyton's wedding-site monorepo. It contains three independently deployed Next.js applications:

- **Canton** is the family wedding website.
- **Blackberry** is the friends wedding website.
- **Save the Date** is the save-the-date card that goes out ahead of both.

The sites own different content and page composition while sharing a visual foundation.

## Repository layout

```text
apps/
  canton/         Family wedding site
  blackberry/     Friends wedding site
  save-the-date/  Save-the-date card
packages/
  ui/                Shared visual primitives and design tokens
  eslint-config/     Shared ESLint flat configs
  typescript-config/ Shared TypeScript configs
```

This is a multi-app Turborepo, not a runtime-composed Module Federation system. Each app builds and deploys independently.

## Prerequisites

- Node.js 24.x
- pnpm 10.15.0

Enable the package manager and install dependencies:

```bash
corepack enable
pnpm install
```

## Local development

Run every site:

```bash
pnpm dev
```

- Canton: http://localhost:3000
- Blackberry: http://localhost:3001
- Save the Date: http://localhost:3002

Run one workspace:

```bash
pnpm --filter @mocha/canton dev
pnpm --filter @mocha/blackberry dev
pnpm --filter @mocha/save-the-date dev
pnpm --filter @mocha/ui test
```

Turbo understands the workspace dependency graph and caches successful task outputs. Root commands run only the tasks needed by the selected workspaces and their dependencies; use `--filter` when you intentionally want to narrow local work to one app or package.

## Required verification

Before opening or updating a pull request, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Vitest and React Testing Library cover shared and interactive component behavior. Add focused tests with future forms and client interactions. Add Playwright only when a real end-to-end flow exists.

## Application boundaries

- Keep Canton-specific content and composition in `apps/canton`.
- Keep Blackberry-specific content and composition in `apps/blackberry`.
- Keep Save the Date-specific content and composition in `apps/save-the-date`.
- Put a component in `packages/ui` when more than one app deliberately shares its visual behavior.
- Keep Server Components as the default. Use `"use client"` only for browser state, effects, events, or browser-only APIs.
- Use `next/image` for future site imagery.
- Add persistence, form services, uploads, and error states with the features that need them.

## Agentic contribution flow

This repository is intended to be developed primarily with compatible coding agents. Every
change — docs included — lands through a pull request on its own branch; nothing is pushed or
committed directly to `main`.

Two paths are accepted, chosen by scope:

- **Direct PR** for small, well-scoped changes (docs, config/tooling fixes, dependency bumps,
  backfilling tests, small bug fixes with an obvious root cause): branch, make the change, verify
  it, open a PR.
- **Superpowers workflow** for anything creative, behavioral, or architectural (new features, new
  components or page sections, new business logic, or any change involving a design decision):

  1. Use `superpowers:brainstorming` before creative, architectural, or behavioral work and obtain approval.
  2. Use `superpowers:writing-plans` for approved multi-step changes.
  3. Implement with `superpowers:test-driven-development`.
  4. Diagnose unexpected behavior with `superpowers:systematic-debugging`.
  5. Run `superpowers:verification-before-completion` before claiming success.
  6. Use `superpowers:requesting-code-review` before merge.
  7. Use `superpowers:finishing-a-development-branch` to open the pull request — always "push and
     create a PR," never a local merge or a direct push to `main`.

Keep specifications in `docs/superpowers/specs/` and implementation plans in `docs/superpowers/plans/`.

## Vercel deployment

Import this Git repository three times in Vercel:

| Project | Root Directory | Suggested custom domain |
| --- | --- | --- |
| Canton | `apps/canton` | `canton.<your-domain>` |
| Blackberry | `apps/blackberry` | `blackberry.<your-domain>` |
| Save the Date | `apps/save-the-date` | `savethedate.<your-domain>` |

For each project:

1. Import the same repository.
2. Select the corresponding app as the Root Directory.
3. Keep Vercel's detected Next.js, pnpm, and Turborepo settings.
4. Set Node.js to 24.x.
5. Deploy and verify the preview URL.
6. Add the corresponding custom subdomain under Project Settings → Domains.
7. At your domain registrar or DNS provider, apply the DNS record Vercel provides for that subdomain.
8. Wait for Vercel to report **Valid Configuration**, then smoke-check the production custom hostname.
9. Configure environment variables separately for each project. Save the Date needs
   `NEXT_PUBLIC_FORMSPREE_ENDPOINT` set to `https://formspree.io/f/<form id>` for Production and
   Preview — without it, its address form fails into an error state by design. See
   [`apps/save-the-date/README.md`](apps/save-the-date/README.md).

No root proxy or `vercel.json` is required for separate subdomains.

A commit can create previews for every connected Vercel project. Turborepo and Vercel can skip unaffected application work from the workspace graph; a change to `packages/ui` affects all three sites, because all three depend on it.

## Scaffold provenance

The initial applications were generated with the official Next.js CLI:

```bash
npx create-next-app@latest apps/canton --ts --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*" --use-pnpm --disable-git --skip-install --no-react-compiler --yes
npx create-next-app@latest apps/blackberry --ts --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*" --use-pnpm --disable-git --skip-install --no-react-compiler --yes
```

`apps/save-the-date` was **not** generated by the CLI. It was created by hand from
`apps/blackberry`'s configuration files, so that the third app matches the second one exactly
rather than re-importing whatever the generator's current defaults happen to be.

The `<your-domain>` token in the deployment table is intentional and must be replaced only after the real parent domain is known.
