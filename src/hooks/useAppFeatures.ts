import { useFeatureFlag } from "configcat-react";

const DEV_FEATURE_FLAGS = {
  "feature-a": true,
};

export function useAppFeatures() {
  const isDev = process.env.NODE_ENV !== "production";

  const { value: ccFeatureA, loading: featureALoading } = useFeatureFlag(
    "feature-a",
    true,
  );

  return {
    // If we are in Dev, we are never "loading", we respond instantly.
    isLoading: isDev ? false : featureALoading,

    // Business rule: Are we in dev? Use dictionary. Are we in Prod? Use ConfigCat.
    featureA: isDev ? DEV_FEATURE_FLAGS["feature-a"] : ccFeatureA,
  };
}
