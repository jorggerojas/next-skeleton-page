---
name: normalizers
description: Transform external API responses to internal data types. Use when receiving data from external APIs that need to be converted to project types.
scope: [api-routes, serializers]
---

# Normalizers

## Overview

Normalizers transform data from external API responses (verbose names) to our internal types (short, simple names). They handle field name mapping, data transformation, type conversion, and data validation for incoming responses.

**Full documentation**: See `src/lib/TRANSFORMATIONS.md` for complete field mappings and examples.

**Where to use**: Only in **API routes** when the route calls an external API. Actions and hooks do not use normalizers (they call the internal API, which already returns internal format).

## Location

All normalizers go in `src/lib/normalizers/`. Use kebab-case for file names. Export from `src/lib/normalizers/index.ts`.

```
src/lib/normalizers/
├── user-normalizer.ts
├── index.ts
└── README.md
```

## Field Mappings (User Example)

| External API (verbose) | Internal (short) |
|------------------------|------------------|
| `_id` | `id` |
| `fullName` | `name` |
| `emailAddress` | `email` |
| `userRole` | `role` |

## Structure

```tsx
// src/lib/normalizers/user-normalizer.ts
import type { User } from "@/types/user";
import type { ExternalUser } from "@/types/external-user";

const normalizeRole = (role: string): User["role"] => {
  const roleMap: Record<string, User["role"]> = {
    admin: "admin",
    user: "user",
    guest: "guest",
  };
  return roleMap[role.toLowerCase()] || "user";
};

export const normalizeUser = (external: ExternalUser): User => {
  return {
    id: external._id,
    name: external.fullName,
    email: external.emailAddress,
    role: normalizeRole(external.userRole),
  };
};

export const normalizeUserList = (externals: ExternalUser[]): User[] => {
  return externals.map(normalizeUser);
};
```

## Safe Normalization (with validation)

```tsx
export const normalizeUserSafe = (
  external: Partial<ExternalUser>,
): User | null => {
  // Validate required fields
  if (!external._id || !external.fullName || !external.emailAddress) {
    console.warn("Invalid user data:", external);
    return null;
  }

  return {
    id: external._id,
    name: external.fullName,
    email: external.emailAddress,
    role: normalizeRole(external.userRole ?? "user"),
  };
};

export const normalizeUserListSafe = (
  externals: Partial<ExternalUser>[],
): User[] => {
  return externals
    .map(normalizeUserSafe)
    .filter((u): u is User => u !== null);
};
```

## Usage in API Routes

Use `externalClient` from `@/lib/api/external-client` and types from `@/types/external-user` for the external response shape (e.g. `ExternalUsersResponse` with `users`, `ExternalUserResponse` with `data`).

```tsx
// src/pages/api/users.ts
import { normalizeUserList } from "@/lib/normalizers";
import { externalClient } from "@/lib/api/external-client";
import type { ExternalUsersResponse } from "@/types/external-user";

// GET: external returns { users: ExternalUser[], pagination? }
const response = await externalClient.get<ExternalUsersResponse>("users?pageNumber=1&pageSize=10");
const users = normalizeUserList(response.data?.users ?? []);
return res.status(200).json({ message: HTTP_RESPONSE_MESSAGE.SUCCESS, data: { users, pagination }, status: 200 });
```

## Export Pattern

```tsx
// src/lib/normalizers/index.ts
export { 
  normalizeUser, 
  normalizeUserList,
  normalizeUserSafe,
  normalizeUserListSafe,
} from "./user-normalizer";
```

Import with:

```tsx
import { normalizeUser } from "@/lib/normalizers";
```

## Important Notes

- **Location**: `src/lib/normalizers/` (not `src/normalizers/`)
- **File naming**: Use kebab-case (e.g., `user-normalizer.ts`)
- **One-way transformation** - Normalizers only convert external → internal format
- **Use serializers for the opposite** - Internal → external (see serializers skill)
- **See `src/lib/TRANSFORMATIONS.md`** for complete field mappings
- **Keep normalizers pure** - No side effects, just data transformation
- **Value transformations**: Map external format to internal types (e.g. role strings → union type)
- **Field transformations**: Verbose names → short names
- **External types**: Define in `@/types/external-{resource}` (e.g. `ExternalUser`, `ExternalUsersResponse`)
- **Safe versions**: Create `*Safe` versions that validate and filter invalid data
