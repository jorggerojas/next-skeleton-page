# Project

## Overview

Next.js starter/skeleton project with Pages Router. Pre-configured with modern tooling for linting, testing, and releases.

## Tech stack

- Next.js 16 (Pages Router)
- React 19
- TypeScript
- Tailwind CSS 4
- bun

## Key Dependencies

- **State**: Zustand
- **Forms**: react-hook-form + Zod
- **Icons**: lucide-react
- **Toasts**: Sonner
- **Analytics**: react-gtm-module

## Development Commands

- `bun dev` - Start dev server
- `bun build` - Production build
- `bun lint` - Lint and fix with Biome
- `bun test` - Run Vitest unit tests
- `bun test:coverage` - Run tests with coverage
- `bun release:[minor|patch|major]` - Create release with standard-version (according to the type of release)

## Environment Setup

Copy `.env.example` to `.env.local` for local development. Use `.env.test` for test environment (CI).

## Key Features

- Biome for linting/formatting (replaces ESLint + Prettier)
- Vitest + Testing Library for unit tests
- Playwright for E2E tests
- Husky + commitlint for conventional commits
- standard-version for semantic releases
- GitHub Actions workflow for Playwright

## Development Principles & Patterns

- Follow conventional commits (enforced by commitlint)
- Run `bun lint` before committing (enforced by husky pre-commit)
- Use Zustand for global state, react-hook-form for form state
- Validate forms with Zod schemas
- No CSS modules, no CSS files, only `src/styles/globals.css` and all the related styles will be places as classNames with Tailwilnd.

## Extra notes

- USE PAGES ROUTER ALWAYS
- Pages Router structure: `src/pages/`
- API routes: `src/pages/api/`
- Global styles: `src/styles/globals.css`
- Test setup: `src/tests/setup.tsx`

## TypeScript & Types

- **All types go in `src/types/`** - organize by domain or feature
- **Avoid `any` type at all costs** - use proper types, `unknown`, or generics
- **Use TypeScript strictly** - enable strict mode in `tsconfig.json`
- **Define interfaces for props** - never use inline object types for component props
- **Export types from type files** - import from `@types/*` alias

## Agent Skills

This project includes Cursor agent skills located in `.cursor/skills/`.

Skills may include a `scope` field in their frontmatter that lists related skills to consider reading. When a skill has scope, check those related skills for additional context.

### Available Skills

- **api-routes**: Create and work with Next.js API routes in src/pages/api/. Use when creating API endpoints, handling HTTP requests, or working with server-side API logic in Pages Router.
- **components-ui** (scope: stores, testing): Create and organize UI components in src/ui/custom/. Use when creating new custom components, organizing component structure, or working with component exports.
- **hierarchy** (scope: components-ui, hooks, stores, pages-router): Define the components hierarchy, how to use components inside pages and how to mix components and when it's needed to create new ones.
- **hooks** (scope: testing): Create and use custom React hooks in src/hooks/. Use when working with React and want to implement some repetitive functions or extract all the "weight" from a component into a custom functions
- **pages-router** (scope: hooks, stores, components-ui): Work with Next.js Pages Router pages in src/pages/. Use when creating or modifying pages, working with _app.tsx,_document.tsx, or any page components in the Pages Router structure.
- **providers** (scope: stores): Create, configure, and centralize React providers in src/providers/. Use when creating new providers, setting up context providers, or organizing provider structure.
- **schemas** (scope: components-ui, hooks, pages-router, testing): Define the form schemas with yup, how to implement them and where to place them, how to type and how not
- **stores** (scope: testing): Create and manage Zustand stores for UI state in src/stores/. Use when managing global UI state like modals, sidebars, loading states, or toggles.
- **testing**: Write and organize tests using Vitest, React Testing Library, and Playwright. Use when writing unit tests, integration tests, or E2E tests.

These skills are automatically applied when working with their respective domains. Refer to the individual skill files for detailed guidance and examples.

## Creating Skills

Create new skills with:

```bash
bun run create-skill --folder=my-skill --m="Description of the skill" [--scope="hooks,stores"]
```

This generates a `SKILL.md` in `.cursor/skills/my-skill/` with the proper frontmatter and automatically updates this file.
