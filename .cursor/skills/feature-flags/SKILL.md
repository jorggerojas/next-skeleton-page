---
name: feature-flags
description: Create or implement feature flags using ConfigCat, allowing users to correctly choose their path according to the received values
scope: [components-ui,error-tracer,testing]
---

# feature-flags

## Instructions

Create or implement feature flags using ConfigCat. Use `useAppFeatures` for domain flags and `useFeatureFlag` directly for low-level access. Ensure the `FeatureFlagsProvider` wraps the app in `AppProviders`, and that user context (ID, role) is set for ConfigCat targeting and error tracing.

## Architecture

- **Provider**: `src/providers/FeatureFlags.tsx` – ConfigCat setup, user profiling, initial flag refresh
- **Hook**: `src/hooks/useAppFeatures.ts` – Domain-specific flags with dev override
- **Integration**: Error tracer gets user context from the same place as ConfigCat (user ID, role)

## Adding a New Feature Flag

**Define in ConfigCat** dashboard (create flag, e.g. `my-feature`).

**Add to `useAppFeatures`**:

```ts
// src/hooks/useAppFeatures.ts
const DEV_FEATURE_FLAGS = {
  "feature-a": true,
  "feature-b": true,
  "my-feature": false, // dev default
};

export function useAppFeatures() {
  const isDev = process.env.NODE_ENV !== 'production';
  const { value: ccMyFeature, loading: myFeatureLoading } =
    useFeatureFlag("my-feature", false);

  return {
    isLoading: isDev ? false : (/* aggregate all loadings */),
    myFeature: isDev ? DEV_FEATURE_FLAGS["my-feature"] : ccMyFeature,
  };
}
```

**Use in components**:

```tsx
const { myFeature, isLoading } = useAppFeatures();
if (isLoading) return <Skeleton />;
if (myFeature) return <NewFeature />;
return <LegacyFeature />;
```

## Examples

### Provider setup (FeatureFlags.tsx)

- Uses `PollingMode.ManualPoll` and `forceRefreshAsync()` for explicit load.
- Sets user for ConfigCat (`client.setDefaultUser`) and ErrorTracer (`errorTracer.setUser`) from `router.pathname`:
  - e.g. `/admin*` → role `"admin"`, else → role `"user"`
- User ID is stored in `localStorage` and reused per session.

### Dev vs production

- **Dev**: `useAppFeatures` returns values from `DEV_FEATURE_FLAGS`, no loading, no ConfigCat fetch.
- **Production**: Values come from ConfigCat; `isLoading` reflects fetch state.

### Conditional UI

```tsx
const { isFeatureA, isFeatureB, isLoading } = useAppFeatures();
if (isLoading) return null;
return (
  <>
    {isFeatureA && <FeatureAComponent />}
    {isFeatureB && <FeatureBComponent />}
  </>
);
```

## Important Notes

- **Env**: `NEXT_PUBLIC_CONFIG_CAT_SDK` must be set (ConfigCat SDK key).
- **Provider order**: `FeatureFlagsProvider` is inside `QueryProvider` and `ErrorBoundary` in `AppProviders`.
- **User profiling**: User ID + role are set for both ConfigCat targeting and error tracing; avoid duplicate user context logic.
- **Testing**: Mock `useAppFeatures` or wrap the tree in a test `ConfigCatProvider` with fixed values. For unit tests, prefer mocking the hook rather than the real ConfigCat client.
- **Avoid**: Do not call `useFeatureFlag` outside of `ConfigCatProvider`; use `useAppFeatures` in components for consistency.
