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

## Prepare a Release

To publish a release, ensure your terminal and workspace are clean (no uncommitted changes).

> **Important**: This project uses [standard-version](https://github.com/conventional-changelog/standard-version) for semantic versioning. It automatically bumps the version, updates `CHANGELOG.md`, and creates a git tag based on your commit history.

### 1. Checkout to develop and pull latest changes

```bash
git checkout develop
git fetch origin && git pull origin develop
```

> **Note**: If there are conflicts, resolve them before proceeding. **NEVER force push**.

### 2. Create a release branch

```bash
# Replace [VERSION] with the expected version (e.g., 1.2.0)
git checkout -b "release/[VERSION]"
```

### 3. Run the release command

Choose the appropriate release type based on your changes:

```bash
# Patch release (bug fixes): 1.0.0 → 1.0.1
bun run release:patch

# Minor release (new features, backward compatible): 1.0.0 → 1.1.0
bun run release:minor

# Major release (breaking changes): 1.0.0 → 2.0.0
bun run release:major
```

This command will:

- Bump the version in `package.json`
- Update `CHANGELOG.md` with commits since last release
- Create a git commit with the version bump
- Create a git tag (e.g., `v1.2.0`)

### 4. Push the branch and tag

Follow the command on your terminal (something like):
> **NOTE** please verify the terminal after run the release command, that will show you the real command to type

```bash
git push --follow-tags
```

> **Important**: Only push ONE commit. If you need to make changes, amend the commit before pushing.

### 5. Create a Pull Request to `main`

1. Go to GitHub and create a PR from `release/[VERSION]` → `main`
2. Add the changelog content to the PR description
3. Wait for CI checks to pass

### 6. Merge the PR to `main`

- Use "Merge commit"
- If there are merge conflicts
  - **do NOT force resolve**.
  - Delete all the related tags and releases (if created)
  - Go back to step 1 and start over

### 7. Sync `develop` with `main`

```bash
# Pull the merged main
git checkout main
git pull origin main

# Update develop
git checkout develop
git merge main

# Push develop
git push origin develop
```

### 8. Verify the release

1. Go to GitHub → Releases
2. Verify the new release was created automatically
3. Check that the changelog is correct

### Release Checklist

- [ ] Workspace is clean (no uncommitted changes)
- [ ] On `develop` branch with latest changes
- [ ] Created release branch
- [ ] Ran release command (patch/minor/major)
- [ ] Pushed branch and tag
- [ ] Created PR to `main`
- [ ] CI checks passed
- [ ] Merged PR to `main`
- [ ] Synced `develop` with `main`
- [ ] Verified release on GitHub

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
