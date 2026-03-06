# Data Transformations Guide

This document explains how data flows between our internal application format and the external API format, and where normalizers/serializers fit in the app.

## Where transformations are used

- **Normalizers** and **serializers** are used **only in API routes** (`src/pages/api/`) when the route calls an **external API**. They are not used in actions or hooks.
- **Actions** (`src/lib/api/{resource}/actions.ts`) call the **internal** Next.js API (`/api/...`). The internal API returns data already in internal format, so actions do not normalize.
- **Flow**: Page → Hook (uses actions + keys) → Action → Internal API route → (optional) external API. Normalize when reading from external API; serialize when writing to external API.

## Overview

```text
External API ──normalizer──> Internal Format ──serializer──> External API
 (verbose)                    (short/simple)                  (verbose)
 (_id)                        (id)                            (_id)
 (fullName, emailAddress)      (name, email)                   (fullName, emailAddress)
 (userRole: "admin")           (role: "admin")                (userRole: "admin")
```

## Field Mappings (User Example)

| External API (verbose) | Internal (short) | Notes |
| ---------------------- | ---------------- | ----- |
| `_id` | `id` | Underscore removed |
| `fullName` | `name` | Simplified |
| `emailAddress` | `email` | Simplified |
| `userRole` | `role` | Simplified + value transformation |
| `createdAt` | `createdAt` | No change (or coerce to Date) |

### Value Transformations

Common patterns when external and internal formats differ:

- **Case**: External `"admin"` ↔ Internal `"admin"` (or UPPERCASE enum)
- **Booleans**: External `"yes"`/`"no"` or `"SI"`/`"NO"` ↔ Internal `true`/`false`
- **Dates**: External ISO string ↔ Internal `Date` or timestamp

## Usage Examples

### Receiving Data from External API

```typescript
import { normalizeUser, normalizeUserList } from "@/lib/normalizers";

// In API route (GET)
const response = await fetch(`${process.env.EXTERNAL_API_URL}/users`);
const externalData = await response.json();

// Normalize the response
const users = normalizeUserList(externalData.data);

// Now you have clean, simple internal data
return res.status(200).json({
  message: HTTP_RESPONSE_MESSAGE.SUCCESS,
  data: { users },
  status: 200,
});
```

### Sending Data to External API

```typescript
import { serializeCreateUser } from "@/lib/serializers";

// In API route (POST)
const body = req.body as CreateUserBody; // Already in internal format

// Serialize before sending to external API
const serializedData = serializeCreateUser(body);

const response = await fetch(`${process.env.EXTERNAL_API_URL}/users`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(serializedData),
});

const externalData = await response.json();

// Normalize the response back
const user = normalizeUser(externalData);

return res.status(201).json({
  message: HTTP_RESPONSE_MESSAGE.SUCCESS,
  data: { user },
  status: 201,
});
```

## Complete Example

### External API Response

```json
{
  "_id": "65500b04fc13ae05542f99a3",
  "fullName": "Jane Doe",
  "emailAddress": "jane@example.com",
  "userRole": "admin",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### Internal Format (after normalization)

```json
{
  "id": "65500b04fc13ae05542f99a3",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "admin",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

## File structure

```text
src/lib/
├── api/
│   ├── client.ts               # Shared API client (used by actions)
│   └── {resource}/
│       ├── actions.ts          # getUsers, getUser, createUser, updateUser
│       └── keys.ts             # usersKeys.list(params), usersKeys.detail(id), etc.
├── normalizers/
│   ├── {resource}-normalizer.ts  # External → Internal (used in API routes only)
│   ├── index.ts
│   └── README.md
├── serializers/
│   ├── {resource}-serializer.ts  # Internal → External (used in API routes only)
│   ├── index.ts
│   └── README.md
└── TRANSFORMATIONS.md          # This file
```

## App data flow (no duplication)

1. **Page** uses hooks: `useUsers()`, `useUser(id)`, `useCreateUser()`, `useUpdateUser()`.
2. **Hooks** use **actions** as `queryFn`/`mutationFn` and **keys** for `queryKey` and `invalidateQueries`. No direct apiClient or hardcoded keys.
3. **Actions** call the internal API (`apiClient.get("users")`, etc.) and return typed data.
4. **API routes** (`src/pages/api/users/`) return internal format. When they proxy to an external API, they use normalizers (response) and serializers (request) there only.

## Type Safety

All transformations are fully typed:

```typescript
// External type (from API - verbose names)
interface ExternalUser {
  _id: string;
  fullName: string;
  emailAddress: string;
  userRole: string;
  // ...
}

// Internal type (application - short names)
type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
  // ...
};

// Normalizer: ExternalUser → User
export const normalizeUser = (data: ExternalUser): User => { ... };

// Serializer: User → Record<string, unknown>
export const serializeUser = (data: User): Record<string, unknown> => { ... };
```

## Benefits of Short Internal Names

1. **Easier to type**: `user.name` vs `user.fullName` or `user.employeeFullName`
2. **Cleaner code**: `{ name, email, role }` vs `{ fullName, emailAddress, userRole }`
3. **Less redundant**: The context already tells us the resource type
4. **Consistent**: Short names across the app; external format stays in API boundary only
