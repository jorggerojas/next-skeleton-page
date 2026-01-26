---
name: schemas
description: Define the form schemas with yup, how to implement them and where to place them, how to type and how not
scope: [components-ui,hooks,pages-router,testing]
---

# Form Schemas with Yup

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
import * as yup from "yup";

export const userSchema = yup.object({
  name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
  email: yup.string().required("Email is required").email("Invalid email format"),
  age: yup.number().required("Age is required").positive().integer().min(18, "Must be 18 or older"),
});

// Infer type from schema - ALWAYS use InferType
export type UserFormData = yup.InferType<typeof userSchema>;
```

## Type Inference

**CRITICAL**: Always use `yup.InferType` to derive types from schemas. Never manually define types that mirror schemas.

```tsx
// ✅ GOOD: Type inferred from schema
export const loginSchema = yup.object({
  email: yup.string().required().email(),
  password: yup.string().required().min(8),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
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
const stringSchema = yup.object({
  // Required string
  required: yup.string().required("Field is required"),

  // Min/max length
  username: yup.string().min(3).max(20),

  // Email
  email: yup.string().email("Invalid email"),

  // URL
  website: yup.string().url("Invalid URL"),

  // Regex pattern
  phone: yup.string().matches(/^\+?[0-9]{10,14}$/, "Invalid phone number"),

  // One of specific values
  role: yup.string().oneOf(["admin", "user", "guest"]),

  // Trim whitespace
  name: yup.string().trim().required(),
});
```

### Number Validations

```tsx
const numberSchema = yup.object({
  // Positive integer
  quantity: yup.number().positive().integer(),

  // Range
  rating: yup.number().min(1).max(5),

  // Required with default
  count: yup.number().required().default(0),

  // Price (2 decimal places)
  price: yup
    .number()
    .positive()
    .test("decimal", "Max 2 decimal places", (val) =>
      val ? /^\d+(\.\d{1,2})?$/.test(String(val)) : true
    ),
});
```

### Date Validations

```tsx
const dateSchema = yup.object({
  // Required date
  birthDate: yup.date().required(),

  // Min date (must be in future)
  startDate: yup.date().min(new Date(), "Date must be in the future"),

  // Max date (must be in past)
  endDate: yup.date().max(new Date(), "Date must be in the past"),
});
```

### Conditional Validations

```tsx
const conditionalSchema = yup.object({
  hasCompany: yup.boolean(),
  companyName: yup.string().when("hasCompany", {
    is: true,
    then: (schema) => schema.required("Company name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});
```

### Array Validations

```tsx
const arraySchema = yup.object({
  // Array of strings
  tags: yup.array().of(yup.string().required()).min(1, "At least one tag required"),

  // Array of objects
  items: yup
    .array()
    .of(
      yup.object({
        id: yup.string().required(),
        quantity: yup.number().positive().required(),
      })
    )
    .required(),
});
```

## Integration with react-hook-form

```tsx
// src/ui/custom/LoginForm/LoginForm.tsx
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
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
    resolver: yupResolver(loginSchema),
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
const baseUserSchema = yup.object({
  name: yup.string().required(),
  email: yup.string().required().email(),
});

// Extended for registration (adds password)
export const registerSchema = baseUserSchema.concat(
  yup.object({
    password: yup.string().required().min(8),
    confirmPassword: yup
      .string()
      .required()
      .oneOf([yup.ref("password")], "Passwords must match"),
  })
);

// Extended for profile update (optional fields)
export const updateProfileSchema = yup.object({
  name: yup.string().min(2),
  email: yup.string().email(),
  bio: yup.string().max(500),
});
```

### Partial Schemas

```tsx
// Make all fields optional for PATCH requests
const partialUserSchema = userSchema.partial();

export type PartialUserData = yup.InferType<typeof partialUserSchema>;
```

### Pick/Omit Fields

```tsx
// Pick specific fields
const emailOnlySchema = userSchema.pick(["email"]);

// Omit specific fields
const noPasswordSchema = registerSchema.omit(["password", "confirmPassword"]);
```

## Testing Schemas

```tsx
// src/schemas/__tests__/user.schema.test.ts
import { describe, it, expect } from "vitest";
import { userSchema } from "../user.schema";

describe("userSchema", () => {
  it("validates correct data", async () => {
    const validData = {
      name: "John Doe",
      email: "john@example.com",
      age: 25,
    };

    await expect(userSchema.validate(validData)).resolves.toEqual(validData);
  });

  it("rejects invalid email", async () => {
    const invalidData = {
      name: "John",
      email: "invalid-email",
      age: 25,
    };

    await expect(userSchema.validate(invalidData)).rejects.toThrow("Invalid email format");
  });

  it("rejects missing required fields", async () => {
    const incompleteData = {
      name: "John",
    };

    await expect(userSchema.validate(incompleteData)).rejects.toThrow();
  });

  it("rejects age under 18", async () => {
    const underageData = {
      name: "John",
      email: "john@example.com",
      age: 16,
    };

    await expect(userSchema.validate(underageData)).rejects.toThrow("Must be 18 or older");
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

- **Always use `yup.InferType`** - Never manually define types that mirror schemas
- **Schemas in `src/schemas/`** - Keep all schemas organized by domain
- **Export types with schemas** - Always export the inferred type alongside the schema
- **Use `@hookform/resolvers/yup`** - For react-hook-form integration
- **Test your schemas** - Validate edge cases and error messages
- **Never use `any`** - Yup provides full type safety, use it
- **Compose schemas** - Use `.concat()`, `.pick()`, `.omit()` for reusability
- **Custom error messages** - Always provide user-friendly error messages
- **Default values** - Use `.default()` for optional fields with defaults
