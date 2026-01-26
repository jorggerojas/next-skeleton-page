# Next.js Skeleton - Pages Router

Next.js starter/skeleton project with Pages Router. Pre-configured with modern tooling for linting, testing, and releases.

> **Note**: This is a skeleton project template. The README provides basic information and commands, but you'll need to customize it for your specific project needs.

## Tech Stack

- **Next.js 16** (Pages Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **bun** (package manager)

## Key Dependencies

- **State Management**: Zustand
- **Forms**: react-hook-form + Zod
- **Icons**: lucide-react
- **Toasts**: Sonner
- **Analytics**: react-gtm-module
- **Data Fetching**: @tanstack/react-query

## Development Commands

```bash
# Development
bun dev          # Start dev server
bun build        # Production build
bun start        # Start production server

# Code Quality
bun lint         # Lint and fix with Biome
bun lint:ci      # Lint in CI mode (no auto-fix)
bun format       # Format code with Biome

# Testing
bun test         # Run Vitest unit tests
bun test:coverage # Run tests with coverage

# Releases
bun release:patch # Create patch release
bun release:minor # Create minor release
bun release:major # Create major release
```

## Project Structure

- **Pages**: `src/pages/` - All pages and API routes
- **Styles**: `src/styles/globals.css` - Global styles
- **Types**: `src/types/` - TypeScript type definitions
- **Tests**: `src/tests/setup.tsx` - Test setup configuration

## Environment Setup

Copy `.env.example` to `.env.local` for local development. Use `.env.test` for test environment (CI).

## Key Features

- **Biome** for linting/formatting (replaces ESLint + Prettier)
- **Vitest** + Testing Library for unit tests
- **Playwright** for E2E tests
- **Husky** + commitlint for conventional commits
- **standard-version** for semantic releases
- **GitHub Actions** workflow for Playwright

## Development Principles & Patterns

- Follow conventional commits (enforced by commitlint)
- Run `bun lint` before committing (enforced by husky pre-commit)
- Use Zustand for global state, react-hook-form for form state
- Validate forms with Zod schemas
- **USE PAGES ROUTER ALWAYS** - never App Router patterns
- Only pages handle server-side data fetching (not components or hooks)

## Agent Skills

This project includes Cursor agent skills to help with development. See [agent.md](./agent.md) for details.

The skills are located in `.cursor/skills/` and provide guidance for:

- Working with Pages Router (`pages-router`)
- Creating API routes (`api-routes`)

These skills help maintain consistency and follow project patterns automatically. See more here on [README file](.cursor/skills/README.md)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Next.js Pages Router](https://nextjs.org/docs/pages) - Pages Router documentation
- [Biome](https://biomejs.dev/) - Fast formatter and linter
