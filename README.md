# Mocha

Mocha is Liane and Peyton's wedding-site monorepo. It contains two independently deployed Next.js applications:

- **Canton** is the family wedding website.
- **Blackberry** is the friends wedding website.

The sites own different content and page composition while sharing a visual foundation.

## Repository layout

```text
apps/
  canton/       Family wedding site
  blackberry/   Friends wedding site
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

Run both sites:

```bash
pnpm dev
```

- Canton: http://localhost:3000
- Blackberry: http://localhost:3001

Run one workspace:

```bash
pnpm --filter @mocha/canton dev
pnpm --filter @mocha/blackberry dev
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
- Put a component in `packages/ui` when both apps deliberately share its visual behavior.
- Keep Server Components as the default. Use `"use client"` only for browser state, effects, events, or browser-only APIs.
- Use `next/image` for future site imagery.
- Add persistence, form services, uploads, and error states with the features that need them.

## Agentic contribution flow

This repository is intended to be developed primarily with compatible coding agents and the Superpowers workflow:

1. Use `superpowers:brainstorming` before creative, architectural, or behavioral work and obtain approval.
2. Use `superpowers:writing-plans` for approved multi-step changes.
3. Implement with `superpowers:test-driven-development`.
4. Diagnose unexpected behavior with `superpowers:systematic-debugging`.
5. Run `superpowers:verification-before-completion` before claiming success.
6. Use `superpowers:requesting-code-review` before merge.
7. Use `superpowers:finishing-a-development-branch` to prepare the final pull request or integration handoff.

Keep specifications in `docs/superpowers/specs/` and implementation plans in `docs/superpowers/plans/`.

## Vercel deployment

Import this Git repository twice in Vercel:

| Project | Root Directory | Suggested custom domain |
| --- | --- | --- |
| Canton | `apps/canton` | `canton.<your-domain>` |
| Blackberry | `apps/blackberry` | `blackberry.<your-domain>` |

For each project:

1. Import the same repository.
2. Select the corresponding app as the Root Directory.
3. Keep Vercel's detected Next.js, pnpm, and Turborepo settings.
4. Set Node.js to 24.x.
5. Deploy and verify the preview URL.
6. Add the corresponding custom subdomain under Project Settings → Domains.
7. Configure any future environment variables separately for each project.

No root proxy or `vercel.json` is required for separate subdomains.

A commit can create previews for both connected Vercel projects. Turborepo and Vercel can skip unaffected application work from the workspace graph; a change to `packages/ui` affects both sites because both depend on it.

## Scaffold provenance

The initial applications were generated with the official Next.js CLI:

```bash
npx create-next-app@latest apps/canton --ts --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*" --use-pnpm --disable-git --skip-install --no-react-compiler --yes
npx create-next-app@latest apps/blackberry --ts --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*" --use-pnpm --disable-git --skip-install --no-react-compiler --yes
```

The `<your-domain>` token in the deployment table is intentional and must be replaced only after the real parent domain is known.
