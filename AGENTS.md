# Project

## Overview

Next.js starter/skeleton project with Pages Router. Pre-configured with modern tooling for linting, testing, and releases.

## Tech stack

- Next.js 16 (Pages Router)
- React 19
- TypeScript
- Tailwind CSS 4
- pnpm (recommended; also supports bun, npm, yarn)

## Key Dependencies

- **State**: Zustand
- **Forms**: react-hook-form + Zod
- **Icons**: lucide-react
- **Toasts**: Sonner
- **Analytics**: react-gtm-module

## Development Commands

- `pnpm dev` - Start dev server
- `pnpm build` - Production build
- `pnpm lint` - Lint and fix with Biome
- `pnpm test` - Run Vitest unit tests
- `pnpm test:coverage` - Run tests with coverage
- `pnpm release:[minor|patch|major]` - Create release with standard-version (according to the type of release)

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
- Run `pnpm lint` before committing (enforced by husky pre-commit)
- Use Zustand for global state, react-hook-form for form state
- Validate forms with Zod schemas
- No CSS modules, no CSS files, only `src/styles/globals.css` and all the related styles will be placed as classNames with Tailwind.

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
