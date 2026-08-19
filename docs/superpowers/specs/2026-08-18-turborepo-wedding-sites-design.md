# Turborepo Wedding Sites Design

**Date:** 2026-08-18
**Status:** Approved in conversation; awaiting written-spec review

## Purpose

This repository will host two wedding websites for Liane and Peyton:

- **Canton** serves the family wedding website.
- **Blackberry** serves the friends wedding website.

The sites will contain different information and page composition while sharing a visual language. They must deploy independently to separate subdomains of the same parent domain.

The first delivery is boilerplate only. It establishes the monorepo, applications, shared UI foundation, validation commands, continuous integration, deployment documentation, and agent-oriented contribution workflow. It does not implement wedding content, forms, uploads, persistence, authentication, or external services.

## Architectural Decision

Use a lean, custom Turborepo root with pnpm workspaces. Generate each application independently with the official `create-next-app` CLI, then connect the generated applications to shared workspace packages.

This is a multi-app monorepo with independently deployed frontends. It intentionally does not use runtime composition, Module Federation, or a host application. Independent Vercel projects provide the deployment isolation expected from the requested microfrontend arrangement without adding runtime coupling.

The selected structure is:

```text
mocha/
├── .github/workflows/
│   └── ci.yml
├── apps/
│   ├── canton/
│   └── blackberry/
├── packages/
│   ├── ui/
│   ├── eslint-config/
│   └── typescript-config/
├── docs/superpowers/specs/
├── AGENTS.md
├── README.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── turbo.json
```

## Runtime and Tooling

- Use pnpm workspaces for dependency installation and workspace linking.
- Pin the repository to Node.js 24.x, the current Vercel default LTS runtime.
- Use the current stable `create-next-app@latest`, which resolves to the current Next.js 16 release line (16.2 at design time).
- Generate both apps through `npx create-next-app@latest`, passing `--use-pnpm` and explicit flags for TypeScript, ESLint, Tailwind CSS, App Router, a `src/` directory, and the `@/*` import alias.
- Use Turbopack through the standard Next.js development and production commands.
- Commit the generated lockfile so local, CI, and Vercel installations resolve consistently.

The root package will be private and provide Turbo-orchestrated scripts for:

```text
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

Turbo tasks will declare their dependencies and cacheable outputs. Development tasks will remain persistent and uncached. Build outputs will account for Next.js `.next` artifacts without caching development state.

## Next.js Applications

`apps/canton` and `apps/blackberry` are separate Next.js App Router applications. Each application will own:

- routes and layouts;
- wedding-specific content;
- application metadata;
- page composition;
- future form, upload, and server behavior;
- deployment-specific environment variables.

For predictable concurrent development, Canton will use local port 3000 and Blackberry will use local port 3001. Their workspace `dev` scripts will encode those ports so the root `pnpm dev` command remains non-interactive and repeatable.

The generated starter screen in each application will be replaced with a minimal placeholder that proves shared-package integration:

- `Canton — Liane & Peyton`
- `Blackberry — Liane & Peyton`

The placeholders will contain no final wedding details, navigation, imagery, or speculative functionality.

Server Components remain the default. A component receives `"use client"` only when it needs browser state, effects, event-driven interactivity, or browser-only APIs. This keeps the mostly static pages eligible for prerendering and minimizes client JavaScript. Future images should use `next/image`; future forms can use Server Actions or route handlers based on their actual persistence and validation needs.

## Shared Packages

### `@mocha/ui`

The UI workspace establishes a common visual foundation without prematurely selecting a component suite. It will contain:

- shared CSS design tokens;
- Tailwind-compatible shared styling;
- a small reusable `SiteShell` primitive used by both placeholder pages;
- typed public exports;
- React and React DOM as peer dependencies rather than bundled duplicate runtimes.

Wedding-specific copy and page layouts do not belong in this package. New components enter the package only when both applications need the same visual behavior or when a component is intentionally part of the shared design system.

No shadcn/ui or other component library will be installed in this boilerplate. A component library can be evaluated later when real controls, dialogs, navigation, or forms establish concrete requirements.

### Shared TypeScript and ESLint configuration

`@mocha/typescript-config` and `@mocha/eslint-config` will centralize strict, compatible defaults while allowing each application and package to extend them for its runtime. The configurations must support Next.js 16, React, TypeScript, and flat ESLint configuration without duplicating large configuration blocks.

## Styling

Tailwind CSS and CSS custom properties will provide the initial styling foundation. Both applications will consume the same shared tokens and scan the shared UI package for class usage. App-level global styles may set application-specific document concerns, but shared palette, spacing, typography conventions, and primitives belong in `@mocha/ui`.

The boilerplate will use a neutral placeholder theme. It will not make irreversible choices about final wedding colors, fonts, animation, or responsive composition.

## Testing and Verification

The boilerplate will configure Vitest and React Testing Library for client and shared component behavior. One meaningful smoke test will verify that `SiteShell` renders its supplied content. Static page copy will not be exhaustively tested or snapshotted.

The testing strategy evolves with behavior:

- Unit and component tests cover validation rules, interactive states, and reusable client components.
- Playwright is deferred until a real end-to-end flow such as RSVP submission, image upload, or guest-specific access exists.
- Production builds verify that both Next.js applications and their shared dependencies compile together.

Before work is considered complete, the repository-level lint, type-check, test, and build commands must all pass.

## Continuous Integration

`.github/workflows/ci.yml` will run on pull requests and pushes to `main`. It will:

1. check out the repository;
2. install Node.js 24 and pnpm with dependency caching;
3. install with the frozen lockfile;
4. run lint, type-check, tests, and production builds through the root scripts.

The workflow will avoid deployment, secrets, or Vercel coupling. Vercel remains responsible for preview and production deployments after the repository is connected.

## Error Handling

There are no network, storage, or mutation flows in this boilerplate, so it will not invent domain error states. Framework-level compilation, runtime, and missing-route behavior remains with Next.js.

Features that introduce failure modes must introduce their error handling alongside the feature. For example, a future form must define validation, pending, success, retry, and server-failure behavior, and a future upload must define type, size, progress, cancellation, and storage failures.

## Vercel Deployment

Import the same Git repository into two independent Vercel projects:

| Vercel project | Root directory | Custom domain |
| --- | --- | --- |
| Canton | `apps/canton` | `canton.<your-domain>` |
| Blackberry | `apps/blackberry` | `blackberry.<your-domain>` |

Vercel will detect the pnpm lockfile and Turborepo workspace, install from the monorepo context, and include the shared packages used by each application. Each project receives independent production and preview deployments.

No routing proxy, shared Vercel project, or `vercel.json` is required for this topology. Environment variables will be configured separately for each Vercel project when future features need them. The README will explain how to select each root directory, attach the subdomain, and verify DNS and deployment behavior.

## Contributor and Agent Workflow

The root README serves human contributors and will document:

- the purpose of Canton and Blackberry;
- prerequisites and pnpm setup;
- workspace layout and commands;
- how to run one app or one package with Turbo filters;
- shared UI ownership rules;
- testing and completion expectations;
- the Vercel two-project setup;
- the preferred Superpowers-assisted pull request workflow.

The root `AGENTS.md` supplies concise, directly actionable repository guidance to compatible coding agents. It will require agents to respect application boundaries, prefer shared UI only for genuinely shared visuals, preserve the official generated foundation, and run appropriate root verification.

The documented Superpowers workflow is:

1. Use `superpowers:brainstorming` before creative or behavioral changes and obtain design approval.
2. Use `superpowers:writing-plans` for approved multi-step implementation work.
3. Use `superpowers:test-driven-development` for behavior changes.
4. Use `superpowers:systematic-debugging` for bugs and failing tests.
5. Use `superpowers:verification-before-completion` before claiming success.
6. Use `superpowers:requesting-code-review` before merge.
7. Use `superpowers:finishing-a-development-branch` to choose and execute the final branch or pull request handoff.

If the current `create-next-app` generates application-local `AGENTS.md` files, those files will be retained. Their framework-specific instructions supplement the root repository workflow; the more specific app-local guidance applies within that app when it does not conflict with direct contributor requirements.

## Explicit Non-Goals

This boilerplate will not include:

- final wedding branding, content, information architecture, or imagery;
- RSVP, contact, authentication, upload, gallery, or persistence features;
- a database or storage provider;
- analytics, email, CMS, or third-party form services;
- Playwright or end-to-end flows;
- a runtime microfrontend shell or Module Federation;
- shared business logic invented before both applications need it;
- a component library added without concrete UI requirements.

## Acceptance Criteria

The implementation is complete when:

1. Both applications were initially generated by recorded `npx create-next-app@latest` commands and are present under the required names.
2. A frozen pnpm workspace install succeeds on Node.js 24.x.
3. `pnpm dev` runs Canton on port 3000 and Blackberry on port 3001 without a port conflict.
4. Each app renders its distinct placeholder through the shared `SiteShell`.
5. Both apps consume the shared UI, ESLint, and TypeScript packages.
6. Root lint, type-check, test, and build commands pass.
7. The shared UI smoke test passes.
8. GitHub Actions runs the same verification suite for pull requests and `main`.
9. README and `AGENTS.md` document the agreed contributor, agent, and deployment workflows.
10. The repository contains no application functionality beyond the agreed boilerplate.

## References

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js 16.2 announcement](https://nextjs.org/blog/next-16-2)
- [Vercel Turborepo deployment](https://vercel.com/docs/monorepos/turborepo)
- [Vercel monorepo projects](https://vercel.com/docs/monorepos)
- [Vercel-supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
