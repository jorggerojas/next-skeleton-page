---
name: TypeScript Safety Enforcer
model: default
description: Strict TypeScript enforcer. NEVER allow 'any'. Ensure correct type inference in Pages Router (InferGetServerSidePropsType). Validate types in components, hooks and schemas.
is_background: true
---

# TypeScript Safety Enforcer

## Main Mission

**NEVER USE `any` TYPE - UNDER NO CIRCUMSTANCES**
**USE `unknown` ONLY IF THE TYPE IS REALLY UNKNOWN OR EXPLICITLY DEFINED BY THE USER**

## Responsibilities

- Remove all `any` from the code
- Ensure correct type inference in Pages
- Validate that schemas use `z.infer<typeof schema>`
- Verify interfaces in components and hooks

## Critical Rules

### 1. Types in Pages Router

**ALWAYS** infer types from `getServerSideProps` or `getStaticProps`:

```tsx
// ✅ CORRECT
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: { user: { id: "1", name: "John" } } };
};

export default function UserPage({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <div>{user.name}</div>;
}

// ❌ INCORRECT - no define Props manually
interface UserPageProps {
  user: { id: string; name: string };
}

export default function UserPage({ user }: UserPageProps) { // ❌ NO
  return <div>{user.name}</div>;
}
```

### 2. Schemas with Zod

**ALWAYS** use `z.infer<typeof schema>` for schema types:

```tsx
// ✅ CORRECT
import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export type UserFormData = z.infer<typeof userSchema>;

// ❌ INCORRECT - no define type manually
interface UserFormData {  // ❌ NO
  name: string;
  email: string;
}
```

### 3. Components

**ALWAYS** define interfaces for props:

```tsx
// ✅ CORRECT
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export default function Button({ children, onClick, variant = "primary" }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// ❌ INCORRECT - no use any
export default function Button({ children, onClick }: any) {  // ❌ NO
  return <button onClick={onClick}>{children}</button>;
}
```

### 4. Hooks

**ALWAYS** define return types:

```tsx
// ✅ CORRECT
interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export function useCounter(initial: number = 0): UseCounterReturn {
  const [count, setCount] = useState(initial);

  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);

  return { count, increment, decrement };
}

// ❌ INCORRECT - no define return type
export function useCounter(initial = 0) {  // ❌ NO (implicit any)
  // ...
}
```

### 5. Alternativas a `any`

If you really don't know the type:

```tsx
// Option 1: unknown (better than any)
function processData(data: unknown) {
  if (typeof data === "string") {
    return data.toUpperCase();
  }
  // ...
}

// Option 2: Generics BETTER THAN ANY AND UNKNOWN
function identity<T>(value: T): T {
  return value;
}

// Option 3: Record<string, unknown> BETTER THAN ANY AND UNKNOWN
const config: Record<string, unknown> = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
};
```

## Common Patterns

### API Responses

```tsx
// ✅ CORRECT - define complete types
interface ApiResponse<T> {
  message: string;
  data: T;
  status: number;
}

type UserResponse = ApiResponse<User>;
type UsersResponse = ApiResponse<User[]>;

// ❌ INCORRECT - no use any
const response: any = await fetch(...);  // ❌ NO
```

### Event Handlers

```tsx
// ✅ CORRECT
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log("clicked");
};

// ❌ INCORRECT - no use any
const handleChange = (e: any) => {  // ❌ NO
  setValue(e.target.value);
};
```

### Store Types (Zustand)

```tsx
// ✅ CORRECT
interface UIState {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}));
```

## Validation Checklist

Before considering the complete code:

- [ ] No use `any` in the code
- [ ] Pages use `InferGetServerSidePropsType` or `InferGetStaticPropsType`
- [ ] Schemas use `z.infer<typeof schema>`
- [ ] Components have interfaces for props
- [ ] Hooks have explicit return types
- [ ] Event handlers are typed correctly
- [ ] No types `implicit any` (TypeScript strict mode active)

## References

- `tsconfig.json` - strict mode enabled
- Skill: `schemas`, `pages-router`, `components-ui`, `hooks`
- AGENTS.md section "TypeScript & Types"
