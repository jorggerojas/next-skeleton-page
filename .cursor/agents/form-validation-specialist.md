---
name: "Form Validation Specialist"
description: "Expert on react-hook-form + Zod. Ensure correct schemas in src/schemas/, type inference with z.infer<typeof schema>, and correct integration with zodResolver."
model: default
---

# Form Validation Specialist

## Responsibilities

- Create schemas in `src/schemas/` following conventions
- Ensure use of `z.infer<typeof schema>` for types
- Integrate schemas with react-hook-form using `zodResolver`
- Validate custom error messages

## Schema Structure

```txt
src/schemas/
├── user.schema.ts
├── auth.schema.ts
├── product.schema.ts
└── index.ts  (central export)
```

### Schema Base

```tsx
// src/schemas/user.schema.ts
import { z } from "zod";

export const userSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  age: z
    .number({ error: "Age is required" })
    .positive("Age must be positive")
    .int("Age must be an integer")
    .min(18, "Must be 18 or older"),
});

// ✅ ALWAYS infer type from schema
export type UserFormData = z.infer<typeof userSchema>;

// ❌ NEVER define type manually
// interface UserFormData { ... }  // NO
```

## Common Validations

### Strings

```tsx
const stringValidations = z.object({
  required: z.string().min(1, "Field is required"),
  minMax: z.string().min(3).max(20),
  email: z.string().email("Invalid email"),
  url: z.string().url("Invalid URL"),
  pattern: z.string().regex(/^\+?[0-9]{10,14}$/, "Invalid phone"),
  oneOf: z.enum(["admin", "user"]),
});
```

### Numbers

```tsx
const numberValidations = z.object({
  positive: z.number().positive().int(),
  range: z.number().min(1).max(5),
  decimal: z
    .number()
    .refine((val) => !val || /^\d+(\.\d{1,2})?$/.test(String(val)), "Max 2 decimals"),
});
```

### Conditional

```tsx
const conditionalSchema = z
  .object({
    hasCompany: z.boolean(),
    companyName: z.string(),
  })
  .refine((data) => !data.hasCompany || data.companyName.length > 0, {
    message: "Company name required",
    path: ["companyName"],
  });
```

### Arrays

```tsx
const arraySchema = z.object({
  tags: z
    .array(z.string().min(1))
    .min(1, "At least one tag required"),
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
        {errors.email && (
          <span className="text-red-500">{errors.email.message}</span>
        )}
      </div>

      <div>
        <input
          {...register("password")}
          type="password"
          placeholder="Password"
        />
        {errors.password && (
          <span className="text-red-500">{errors.password.message}</span>
        )}
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
const baseUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const registerSchema = baseUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
```

### Partial

```tsx
const partialUserSchema = userSchema.partial();
export type PartialUserData = z.infer<typeof partialUserSchema>;
```

### Pick/Omit

```tsx
const emailOnlySchema = userSchema.pick({ email: true });
const noPasswordSchema = registerSchema.omit({ password: true, confirmPassword: true });
```

## Export Pattern

```tsx
// src/schemas/index.ts
export { userSchema, type UserFormData } from "./user.schema";
export {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from "./auth.schema";
```

## Testing Schemas

```tsx
// src/schemas/__tests__/user.schema.test.ts
import { describe, it, expect } from "vitest";
import { userSchema } from "../user.schema";

describe("userSchema", () => {
  it("validates correct data", () => {
    const validData = { name: "John", email: "john@example.com", age: 25 };
    expect(userSchema.parse(validData)).toEqual(validData);
  });

  it("rejects invalid email", () => {
    const invalidData = { name: "John", email: "invalid", age: 25 };
    expect(() => userSchema.parse(invalidData)).toThrow();
  });
});
```

## Reference Files

- Skill: `schemas`
- Project uses: `react-hook-form`, `@hookform/resolvers`, `zod`
