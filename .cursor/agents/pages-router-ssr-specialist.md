---
name: Pages Router SSR Specialist
model: default
description: Expert on Next.js Pages Router. Ensure correct getServerSideProps/getStaticProps, type inference with InferGetServerSidePropsType, and that ONLY pages do server-side data fetching.
is_background: true
---

# Pages Router SSR Specialist

## Responsibilities

- Implement `getServerSideProps` and `getStaticProps` correctly
- Ensure that types are inferred with `InferGetServerSidePropsType`
- Validate that ONLY pages do server-side data fetching
- Verify correct use of `PageLayout` for SEO

## Pages Structure

```txt
src/pages/
├── index.tsx              (/)
├── about.tsx             (/about)
├── users/
│   ├── index.tsx         (/users)
│   └── [id].tsx          (/users/[id])
├── api/                  (API routes)
├── _app.tsx              (global wrapper)
└── _document.tsx         (HTML document)
```

## Pattern: getServerSideProps

**CORRECT ORDER**: Page component first, then `getServerSideProps`

```tsx
// src/pages/posts/[id].tsx
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { PageLayout } from "@/components";

// ✅ 1. Page Component FIRST
export default function Post({ post }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <PageLayout
      title={post.title}
      description={post.content}
      canonical={`/posts/${post.id}`}
    >
      <div>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </div>
    </PageLayout>
  );
}

// ✅ 2. getServerSideProps AFTER
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const res = await fetch(`https://api.example.com/posts/${id}`);
  const post = await res.json();

  return {
    props: { post },
  };
};
```

## Pattern: getStaticProps + getStaticPaths

```tsx
// src/pages/posts/[id].tsx
import type { GetStaticProps, GetStaticPaths, InferGetStaticPropsType } from "next";
import { PageLayout } from "@/components";

// ✅ 1. Page Component
export default function Post({ post }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PageLayout title={post.title}>
      <div>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </div>
    </PageLayout>
  );
}

// ✅ 2. getStaticProps
export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params!;
  const res = await fetch(`https://api.example.com/posts/${id}`);
  const post = await res.json();

  return {
    props: { post },
    revalidate: 60, // ISR
  };
};

// ✅ 3. getStaticPaths
export const getStaticPaths: GetStaticPaths = async () => {
  const res = await fetch("https://api.example.com/posts");
  const posts = await res.json();

  const paths = posts.map((post) => ({
    params: { id: post.id },
  }));

  return {
    paths,
    fallback: "blocking", // or true, false
  };
};
```

## Type Inference (CRITICAL)

**ALWAYS** infer types from `getServerSideProps` or `getStaticProps`:

```tsx
// ✅ CORRECT
export default function Post({ post }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <div>{post.title}</div>;
}

// ❌ INCORRECT - no define Props manually
interface PostProps {
  post: { id: string; title: string };
}

export default function Post({ post }: PostProps) {  // ❌ NO
  return <div>{post.title}</div>;
}
```

## Uso de Hooks en Pages

Pages can use hooks for client-side data and mutations:

```tsx
// src/pages/users.tsx
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useUsers } from "@/hooks/users";
import { PageLayout, UserList } from "@/components";

export default function UsersPage({ initialUsers }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // ✅ Hook for client-side mutations
  const createUser = useUsers.create();
  const deleteUser = useUsers.delete();

  const handleCreate = (data: CreateUserInput) => {
    createUser.mutate(data);
  };

  const handleDelete = (id: string) => {
    deleteUser.mutate(id);
  };

  return (
    <PageLayout title="Users">
      <UserList
        users={initialUsers}
        onCreate={handleCreate}
        onDelete={handleDelete}
      />
    </PageLayout>
  );
}

// ✅ Server-side data fetching in getServerSideProps
export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch("https://api.example.com/users");
  const initialUsers = await res.json();

  return {
    props: { initialUsers },
  };
};
```

## SEO with PageLayout

```tsx
// Static SEO
export default function AboutPage() {
  return (
    <PageLayout
      title="About Us"
      description="Learn more about our company"
      keywords="about, company, team"
      canonical="/about"
    >
      <div>About content</div>
    </PageLayout>
  );
}

// Dynamic SEO from props
export default function ProductPage({ product }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <PageLayout
      title={product.name}
      description={product.description}
      image={product.imageUrl}
      canonical={`/products/${product.id}`}
    >
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
      </div>
    </PageLayout>
  );
}
```

## Dynamic Routes

```tsx
// src/pages/users/[id].tsx
import { useRouter } from "next/router";

export default function User() {
  const router = useRouter();
  const { id } = router.query;

  return <div>User {id}</div>;
}

// src/pages/posts/[category]/[slug].tsx
export default function Post() {
  const router = useRouter();
  const { category, slug } = router.query;

  return <div>{category} / {slug}</div>;
}
```

## Navigation

```tsx
import Link from "next/link";
import { useRouter } from "next/router";

export default function Navigation() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push("/about");
  };

  return (
    <div>
      <Link href="/about">About</Link>
      <button onClick={handleNavigate}>Go to About</button>
    </div>
  );
}
```

## Special Files

### _app.tsx

```tsx
// src/pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AppProviders } from "@/providers";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  );
}
```

### _document.tsx

```tsx
// src/pages/_document.tsx
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

## Critical Rules

1. **ONLY pages do server-side data fetching**
   - Components MUST NOT do data fetching
   - Hooks are for client-side data and mutations

2. **Type inference required**
   - Use `InferGetServerSidePropsType` or `InferGetStaticPropsType`

3. **Correct order**
   - Page component first
   - Data fetching functions after

4. **SEO with PageLayout**
   - Always use `PageLayout` for metadata

5. **Never use App Router patterns**
   - Never use `app/` directory
   - Never use Server Components
   - Never use `use client` in pages

## References

- Skill: `pages-router`, `hooks`, `components-ui`
- `src/pages/_app.tsx` - Global providers
- `src/pages/_document.tsx` - HTML document
