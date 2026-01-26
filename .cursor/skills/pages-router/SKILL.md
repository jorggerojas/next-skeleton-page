---
name: pages-router
description: Work with Next.js Pages Router pages in src/pages/. Use when creating or modifying pages, working with _app.tsx, _document.tsx, or any page components in the Pages Router structure.
scope: [hooks,stores,components-ui]
---

# Next.js Pages Router

## Structure

This project uses **Pages Router** exclusively. All pages go in `src/pages/`.

- Regular pages: `src/pages/[filename].tsx` → `/filename` route
- Dynamic routes: `src/pages/[id]/page.tsx` → `/[id]` route
- API routes: `src/pages/api/[route].ts` → `/api/[route]` endpoint
- Special files: `_app.tsx`, `_document.tsx` in `src/pages/`

## Creating Pages

### Basic Page

```tsx
// src/pages/about.tsx
export default function About() {
  return <div>About page</div>;
}
```

### Dynamic Route

```tsx
// src/pages/users/[id].tsx
import { useRouter } from 'next/router';

export default function User() {
  const router = useRouter();
  const { id } = router.query;
  
  return <div>User {id}</div>;
}
```

### Nested Dynamic Route

```tsx
// src/pages/posts/[id]/[slug].tsx
import { useRouter } from 'next/router';

export default function Post() {
  const router = useRouter();
  const { id, slug } = router.query;
  
  return <div>Post {id} - {slug}</div>;
}
```

## Special Files

### _app.tsx

Wraps all pages. Use for:

- Global providers
- Global styles
- Layout components
- Page-level state

```tsx
// src/pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

### _document.tsx

Customizes HTML document. Use for:

- `<html>` and `<body>` attributes
- Custom fonts
- Analytics scripts
- Meta tags

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

## Data Fetching

**CRITICAL**: Only pages handle server-side data fetching. Components, hooks, or other files should NOT make server calls directly. All data fetching happens in the page file using `getServerSideProps`, `getStaticProps`, or `getStaticPaths`.

### getServerSideProps

The page component goes first, then the data fetching function. **The page component's Props type MUST be inferred from `getServerSideProps` using `InferGetServerSidePropsType`.**

```tsx
// src/pages/posts/[id].tsx
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { PageLayout } from "@/components";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const res = await fetch(`https://api.example.com/posts/${id}`);
  const post = await res.json();
  
  return {
    props: { post },
  };
};

// Type MUST be inferred from getServerSideProps
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
```

### getStaticProps

**The page component's Props type MUST be inferred from `getStaticProps` using `InferGetStaticPropsType`.**

```tsx
// src/pages/posts/[id].tsx
import type { GetStaticProps, GetStaticPaths, InferGetStaticPropsType } from "next";
import { PageLayout } from "@/components";

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params!;
  const res = await fetch(`https://api.example.com/posts/${id}`);
  const post = await res.json();
  
  return {
    props: { post },
    revalidate: 60, // ISR: revalidate every 60 seconds
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { id: '1' } }, { params: { id: '2' } }],
    fallback: 'blocking', // or true, false
  };
};

// Type MUST be inferred from getStaticProps
export default function Post({ post }: InferGetStaticPropsType<typeof getStaticProps>) {
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
```

### Type Inference

**IMPORTANT**: The page component's `Props` type **MUST** be inferred from `getServerSideProps` or `getStaticProps` using `InferGetServerSidePropsType` or `InferGetStaticPropsType`. Do not manually define the Props type.

```tsx
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: { post: { id: "1", title: "Hello" } },
  };
};

// Type MUST be inferred from getServerSideProps
export default function Post({ post }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <div>{post.title}</div>;
}
```

### Using Hooks in Pages

Pages can use custom hooks for client-side data fetching, mutations, or other client-side logic. Examples:

```tsx
// src/pages/users.tsx
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useUsers } from "@/hooks/users";

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: { initialUsers: [] } };
};

export default function UsersPage({ initialUsers }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: users, isLoading } = useUsers();
  
  return (
    <div>
      {isLoading ? <p>Loading...</p> : <UserList users={users} />}
    </div>
  );
}
```

```tsx
// src/pages/hotels/[id].tsx
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useHotels } from "@/hooks/hotels";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  return { props: { hotelId: id } };
};

export default function HotelPage({ hotelId }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: hotel } = useHotels.getById(hotelId);
  const createMutation = useHotels.create();
  
  const handleCreate = () => {
    createMutation.mutate({ name: "New Hotel" });
  };
  
  return (
    <div>
      <h1>{hotel?.name}</h1>
      <button onClick={handleCreate}>Create Hotel</button>
    </div>
  );
}
```

**Note**: Server-side data fetching (API calls) should only happen in `getServerSideProps` or `getStaticProps`. Hooks like `useUsers()`, `useHotels()`, `useHotels.create()`, etc., are for client-side data fetching, mutations, or other client-side logic.

## Client-Side Navigation

```tsx
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();
  
  return (
    <div>
      <Link href="/about">About</Link>
      <button onClick={() => router.push('/contact')}>
        Go to Contact
      </button>
    </div>
  );
}
```

## SEO with PageLayout

Use the `PageLayout` component for SEO metadata (static or dynamic):

```tsx
// Static SEO
import { PageLayout } from "@/components";

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
```

```tsx
// Dynamic SEO from props
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { PageLayout } from "@/components";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      seo: {
        title: "Dynamic Page",
        description: "Dynamic description",
      },
    },
  };
};

export default function DynamicPage({ seo }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <PageLayout {...seo}>
      <div>Content</div>
    </PageLayout>
  );
}
```

## Important Notes

- **Always use Pages Router** - never App Router patterns
- **Only pages handle server-side data fetching** - components, hooks, or other files should NOT make server calls
- **Page Props type MUST be inferred** - use `InferGetServerSidePropsType<typeof getServerSideProps>` or `InferGetStaticPropsType<typeof getStaticProps>`
- Pages are React components that export a default function
- Data fetching functions (`getServerSideProps`, `getStaticProps`, `getStaticPaths`) go **after** the page component
- Pages can use hooks like `useUsers()`, `useHotels()`, `useHotels.create()`, etc. for client-side data fetching and mutations
- Use `PageLayout` component for SEO metadata (static or dynamic)
- Use `useRouter` from `next/router` (not `next/navigation`)
- Global styles go in `src/styles/globals.css` and imported in `_app.tsx`
- TypeScript: Use `AppProps` from `next/app` for `_app.tsx`
- The app includes `ErrorBoundary` and `QueryProvider` in `_app.tsx` - they wrap all pages automatically
