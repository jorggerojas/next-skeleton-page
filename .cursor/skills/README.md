# Cursor Skills

These skills are read **automatically** by:

1. **MCPs** - Read directly from `.cursor/skills/`

## How do they work?

### In Cursor

- Agents automatically read `SKILL.md` files in `.cursor/skills/`
- They use the frontmatter description to decide when to apply each skill
- They follow the instructions in the skill content

## Structure

Each skill must have:

- A directory with the skill name
- A `SKILL.md` file with YAML frontmatter and markdown content

```txt
.cursor/skills/
├── components-ui/
│   └── SKILL.md
├── api-routes/
│   └── SKILL.md
└── ...
```

## Frontmatter

```yaml
---
name: skill-name
description: Description that helps the agent decide when to use this skill
scope: [related-skill1,related-skill2]
---
```

### Scope

The `scope` field is optional and lists related skills that should be considered when using this skill. When a skill has scope, the agent should check those related skills for additional context and rules.

Example: `components-ui` has `scope: [stores,testing]` because when creating components, you might need to understand how to use stores and how to write tests for them.

## Available Skills

- **api-routes**: Create and work with Next.js API routes in src/pages/api/. Use when creating API endpoints, handling HTTP requests, or working with server-side API logic in Pages Router.
- **components-ui** (scope: stores, testing): Create and organize UI components in src/components/custom/. Use when creating new custom components, organizing component structure, or working with component exports.
- **error-tracer** (scope: api-routes, components-ui, hierarchy, hooks, normalizers, pages-router, providers, schemas, serializers, stores, testing): Trace all errors and send it to the error tracer manager (could be different ones) in one simple implementation. This tracer can manage ui, render, ux, api calls, flows, etc.
- **feature-flags** (scope: components-ui, error-tracer, testing): Create or implement feature flags using ConfigCat, allowing users to correctly choose their path according to the received values
- **hierarchy** (scope: components-ui, hooks, stores, pages-router): Define the components hierarchy, how to use components inside pages and how to mix components and when it's needed to create new ones.
- **hooks** (scope: testing): Create and use custom React hooks in src/hooks/. Use when working with React and want to implement some repetitive functions or extract all the "weight" from a component into a custom functions
- **normalizers** (scope: api-routes, serializers): Transform external API responses to internal data types. Use when receiving data from external APIs that need to be converted to project types.
- **pages-router** (scope: hooks, stores, components-ui): Work with Next.js Pages Router pages in src/pages/. Use when creating or modifying pages, working with `_app.tsx`, `_document.tsx`, or any page components in the Pages Router structure.
- **providers** (scope: stores): Create, configure, and centralize React providers in src/providers/. Use when creating new providers, setting up context providers, or organizing provider structure.
- **schemas** (scope: components-ui, hooks, pages-router, testing): Define the form schemas with Zod, how to implement them and where to place them, how to type and how not
- **serializers** (scope: api-routes, normalizers): Create and use serializers to transform internal data types to external API format. Use when sending data to external APIs that require different field names or structure.
- **stores** (scope: testing): Create and manage Zustand stores for UI state in src/stores/. Use when managing global UI state like modals, sidebars, loading states, or toggles.
- **testing**: Write and organize tests using Vitest, React Testing Library, and Playwright. Use when writing unit tests, integration tests, or E2E tests.
