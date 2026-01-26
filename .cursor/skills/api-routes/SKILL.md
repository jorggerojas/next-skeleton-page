---
name: api-routes
description: Create and work with Next.js API routes in src/pages/api/. Use when creating API endpoints, handling HTTP requests, or working with server-side API logic in Pages Router.
---

# Next.js API Routes (Pages Router)

## Structure

API routes go in `src/pages/api/` and automatically become endpoints.

- `src/pages/api/users.ts` → `/api/users`
- `src/pages/api/users/[id].ts` → `/api/users/[id]`
- `src/pages/api/posts/[id]/comments.ts` → `/api/posts/[id]/comments`

## Basic API Route

Always use the `HttpResponses` type from `src/types/http-responses.ts` for consistent API responses.

```tsx
// src/pages/api/hello.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_RESPONSE_MESSAGE, type HttpResponses } from "@/types/http-responses";

type User = {
  name: string;
};

type Response = HttpResponses<User>;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response["success"]["data"] | Response["error"]>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: HTTP_RESPONSE_MESSAGE.METHOD_NOT_ALLOWED,
      status: 405,
      errors: `Method ${req.method} not allowed`,
    });
  }

  res.status(200).json({
    message: HTTP_RESPONSE_MESSAGE.SUCCESS,
    data: { name: "John Doe" },
    status: 200,
  });
}
```

## HTTP Methods

Handle different HTTP methods using `HttpResponses` type:

```tsx
// src/pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_RESPONSE_MESSAGE, type HttpResponses } from "@/types/http-responses";

type User = {
  id: string;
  name: string;
  email: string;
};

type Response = HttpResponses<User[] | User>;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response["success"]["data"] | Response["error"]>,
) {
  if (req.method === "GET") {
    // Fetch users
    const users: User[] = [];
    res.status(200).json({
      message: HTTP_RESPONSE_MESSAGE.SUCCESS,
      data: users,
      status: 200,
    });
  } else if (req.method === "POST") {
    // Create user
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        message: HTTP_RESPONSE_MESSAGE.BAD_REQUEST,
        status: 400,
        errors: "Name and email are required",
      });
    }
    
    const user: User = { id: Date.now().toString(), name, email };
    res.status(201).json({
      message: HTTP_RESPONSE_MESSAGE.SUCCESS,
      data: user,
      status: 201,
    });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({
      message: HTTP_RESPONSE_MESSAGE.METHOD_NOT_ALLOWED,
      status: 405,
      errors: `Method ${req.method} not allowed`,
    });
  }
}
```

## Dynamic Routes

```tsx
// src/pages/api/users/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_RESPONSE_MESSAGE, type HttpResponses } from "@/types/http-responses";

type User = {
  id: string;
  name: string;
  email: string;
};

type Response = HttpResponses<User>;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response["success"]["data"] | Response["error"]>,
) {
  const { id } = req.query;
  
  if (req.method === "GET") {
    // Fetch user by id
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        message: HTTP_RESPONSE_MESSAGE.BAD_REQUEST,
        status: 400,
        errors: "Invalid user ID",
      });
    }
    
    const user: User = { id, name: "User", email: "user@example.com" };
    res.status(200).json({
      message: HTTP_RESPONSE_MESSAGE.SUCCESS,
      data: user,
      status: 200,
    });
  } else if (req.method === "PUT") {
    // Update user
    const updatedUser: User = { id: id as string, ...req.body };
    res.status(200).json({
      message: HTTP_RESPONSE_MESSAGE.SUCCESS,
      data: updatedUser,
      status: 200,
    });
  } else if (req.method === "DELETE") {
    // Delete user
    res.status(204).end();
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).json({
      message: HTTP_RESPONSE_MESSAGE.METHOD_NOT_ALLOWED,
      status: 405,
      errors: `Method ${req.method} not allowed`,
    });
  }
}
```

## Request Body

```tsx
// src/pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_RESPONSE_MESSAGE, type HttpResponses } from "@/types/http-responses";

type User = {
  id: string;
  name: string;
  email: string;
};

type Response = HttpResponses<User>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response["success"]["data"] | Response["error"]>,
) {
  if (req.method === "POST") {
    const { name, email } = req.body;
    
    // Validate
    if (!name || !email) {
      return res.status(400).json({
        message: HTTP_RESPONSE_MESSAGE.BAD_REQUEST,
        status: 400,
        errors: "Name and email are required",
      });
    }
    
    // Process
    const user: User = { id: Date.now().toString(), name, email };
    
    res.status(201).json({
      message: HTTP_RESPONSE_MESSAGE.SUCCESS,
      data: user,
      status: 201,
    });
  }
}
```

## Query Parameters

```tsx
// src/pages/api/search.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_RESPONSE_MESSAGE, type HttpResponses } from "@/types/http-responses";

type SearchResult = {
  id: string;
  title: string;
};

type Response = HttpResponses<{ results: SearchResult[]; limit: number }>;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response["success"]["data"] | Response["error"]>,
) {
  const { q, limit = "10" } = req.query;
  
  if (!q || Array.isArray(q)) {
    return res.status(400).json({
      message: HTTP_RESPONSE_MESSAGE.BAD_REQUEST,
      status: 400,
      errors: "Query parameter 'q' is required",
    });
  }
  
  // Search logic
  const results: SearchResult[] = [];
  
  res.status(200).json({
    message: HTTP_RESPONSE_MESSAGE.SUCCESS,
    data: { results, limit: Number(limit) },
    status: 200,
  });
}
```

## Error Handling

```tsx
// src/pages/api/users/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_RESPONSE_MESSAGE, type HttpResponses } from "@/types/http-responses";

type User = {
  id: string;
  name: string;
  email: string;
};

type Response = HttpResponses<User>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response["success"]["data"] | Response["error"]>,
) {
  try {
    const { id } = req.query;
    
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        message: HTTP_RESPONSE_MESSAGE.BAD_REQUEST,
        status: 400,
        errors: "ID is required",
      });
    }
    
    // Fetch user
    const user = await fetchUser(id);
    
    if (!user) {
      return res.status(404).json({
        message: HTTP_RESPONSE_MESSAGE.NOT_FOUND,
        status: 404,
        errors: "User not found",
      });
    }
    
    res.status(200).json({
      message: HTTP_RESPONSE_MESSAGE.SUCCESS,
      data: user,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: HTTP_RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
      status: 500,
      errors: "Internal server error",
    });
  }
}
```

## Important Notes

- **Always use `HttpResponses` type** from `src/types/http-responses.ts` for consistent API responses
- Import `HTTP_RESPONSE_MESSAGE` enum for standardized error messages
- API routes are server-side only
- Use `NextApiRequest` and `NextApiResponse` types
- Export a default function named `handler`
- Access dynamic route params via `req.query` (always check if it's an array)
- Access request body via `req.body` (automatically parsed for JSON)
- Use `HttpResponses<T>` where `T` is your data type
- Response structure: `{ message, data, status }` for success, `{ message, status, errors }` for errors
- Set status codes: `res.status(200)`, `res.status(404)`, etc.
- End responses: `res.json()`, `res.end()`, or `res.status(204).end()`
- Check `req.method` to handle different HTTP verbs
- Query params are always strings or string arrays (convert with `Number()`, check with `Array.isArray()`, etc.)
