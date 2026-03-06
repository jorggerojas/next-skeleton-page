---
name: schemas
description: Define the form schemas with Zod, how to implement them and where to place them, how to type and how not
scope: [components-ui,hooks,pages-router,testing]
---

# Form Schemas with Zod

## Location

All schemas go in `src/schemas/`. One file per domain/feature.

```txt
src/schemas/
├── user.schema.ts      # User-related schemas
├── auth.schema.ts      # Authentication schemas
├── product.schema.ts   # Product schemas
└── index.ts            # Central export
```

## Basic Schema Definition

```tsx
// src/schemas/user.schema.ts
import { z } from "zod";

export const userSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  age: z
    .number({ error: "Age is required" })
    .positive()
    .int()
    .min(18, "Must be 18 or older"),
});

// Infer type from schema - ALWAYS use z.infer
export type UserFormData = z.infer<typeof userSchema>;
```

## Type Inference

**CRITICAL**: Always use `z.infer<typeof schema>` to derive types from schemas. Never manually define types that mirror schemas.

```tsx
// ✅ GOOD: Type inferred from schema
export const loginSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1).min(8),
});

export type LoginFormData = z.infer<typeof loginSchema>;
// Result: { email: string; password: string }

// ❌ BAD: Manual type definition
interface LoginFormData {
  email: string;
  password: string;
}
// This can get out of sync with schema!
```

## Common Validations

### String Validations

```tsx
const stringSchema = z.object({
  // Required string
  required: z.string().min(1, "Field is required"),

  // Min/max length
  username: z.string().min(3).max(20),

  // Email
  email: z.string().email("Invalid email"),

  // URL
  website: z.string().url("Invalid URL"),

  // Regex pattern
  phone: z.string().regex(/^\+?[0-9]{10,14}$/, "Invalid phone number"),

  // One of specific values
  role: z.enum(["admin", "user", "guest"]),

  // Trim whitespace (Zod trims by default for email/url)
  name: z.string().trim().min(1),
});
```

### Number Validations

```tsx
const numberSchema = z.object({
  // Positive integer
  quantity: z.number().positive().int(),

  // Range
  rating: z.number().min(1).max(5),

  // Optional with default
  count: z.number().default(0),

  // Price (2 decimal places)
  price: z
    .number()
    .positive()
    .refine((val) => !val || /^\d+(\.\d{1,2})?$/.test(String(val)), {
      message: "Max 2 decimal places",
    }),
});
```

### Date Validations

```tsx
const dateSchema = z.object({
  // Required date
  birthDate: z.coerce.date(),

  // Min date (must be in future)
  startDate: z.coerce.date().refine((d) => d >= new Date(), "Date must be in the future"),

  // Max date (must be in past)
  endDate: z.coerce.date().refine((d) => d <= new Date(), "Date must be in the past"),
});
```

### Conditional Validations

```tsx
const conditionalSchema = z
  .object({
    hasCompany: z.boolean(),
    companyName: z.string(),
  })
  .refine((data) => !data.hasCompany || data.companyName.length > 0, {
    message: "Company name is required",
    path: ["companyName"],
  });
```

### Array Validations

```tsx
const arraySchema = z.object({
  // Array of strings
  tags: z.array(z.string().min(1)).min(1, "At least one tag required"),

  // Array of objects
  items: z.array(
    z.object({
      id: z.string().min(1),
      quantity: z.number().positive(),
    })
  ),
});
```

## Integration with react-hook-form

```tsx
// src/components/custom/LoginForm/LoginForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleFormSubmit = (data: LoginFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div>
        <input {...register("email")} placeholder="Email" />
        {errors.email && <span className="text-red-500">{errors.email.message}</span>}
      </div>

      <div>
        <input {...register("password")} type="password" placeholder="Password" />
        {errors.password && <span className="text-red-500">{errors.password.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Loading..." : "Login"}
      </button>
    </form>
  );
}
```

## Schema Composition

### Extending Schemas

```tsx
// Base user schema
const baseUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// Extended for registration (adds password)
export const registerSchema = baseUserSchema
  .extend({
    password: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

// Extended for profile update (optional fields)
export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(500).optional(),
});
```

### Partial Schemas

```tsx
// Make all fields optional for PATCH requests
const partialUserSchema = userSchema.partial();

export type PartialUserData = z.infer<typeof partialUserSchema>;
```

### Pick/Omit Fields

```tsx
// Pick specific fields
const emailOnlySchema = userSchema.pick({ email: true });

// Omit specific fields
const noPasswordSchema = registerSchema.omit({ password: true, confirmPassword: true });
```

## Testing Schemas

```tsx
// src/schemas/__tests__/user.schema.test.ts
import { describe, it, expect } from "vitest";
import { userSchema } from "../user.schema";

describe("userSchema", () => {
  it("validates correct data", () => {
    const validData = {
      name: "John Doe",
      email: "john@example.com",
      age: 25,
    };

    expect(userSchema.parse(validData)).toEqual(validData);
  });

  it("rejects invalid email", () => {
    const invalidData = {
      name: "John",
      email: "invalid-email",
      age: 25,
    };

    expect(() => userSchema.parse(invalidData)).toThrow();
  });

  it("rejects missing required fields", () => {
    const incompleteData = {
      name: "John",
    };

    expect(() => userSchema.parse(incompleteData)).toThrow();
  });

  it("rejects age under 18", () => {
    const underageData = {
      name: "John",
      email: "john@example.com",
      age: 16,
    };

    expect(() => userSchema.parse(underageData)).toThrow();
  });
});
```

## Central Export

```tsx
// src/schemas/index.ts
export { userSchema, type UserFormData } from "./user.schema";
export { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from "./auth.schema";
export { productSchema, type ProductFormData } from "./product.schema";
```

## Usage in Pages

```tsx
// src/pages/register.tsx
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { PageLayout, RegisterForm } from "@/components";
import { useAuth } from "@/hooks/auth";
import type { RegisterFormData } from "@/schemas";

export default function RegisterPage() {
  const { register } = useAuth();

  const handleRegister = async (data: RegisterFormData) => {
    await register.mutateAsync(data);
  };

  return (
    <PageLayout title="Register" description="Create your account">
      <RegisterForm onSubmit={handleRegister} />
    </PageLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
```

## Important Notes

- **Always use `z.infer<typeof schema>`** - Never manually define types that mirror schemas
- **Schemas in `src/schemas/`** - Keep all schemas organized by domain
- **Export types with schemas** - Always export the inferred type alongside the schema
- **Use `@hookform/resolvers/zod`** - For react-hook-form integration (zodResolver)
- **Test your schemas** - Validate edge cases and error messages
- **Never use `any`** - Zod provides full type safety, use it
- **Compose schemas** - Use `.extend()`, `.pick()`, `.omit()`, `.merge()` for reusability
- **Custom error messages** - Pass as second argument: `z.string().min(1, "Required")`
- **Default values** - Use `.default()` for optional fields with defaults
