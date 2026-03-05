import { useEffect, useState } from "react";
import {
  ConfigCatProvider,
  PollingMode,
  useConfigCatClient,
} from "configcat-react";
import { errorTracer } from "@/lib/observability/error";
import type { UserID } from "@/types/errors";

// Function to keep a stable ID during the session
function getUserID(): UserID {
  if (typeof window === "undefined") return crypto.randomUUID();
  let id = window.localStorage.getItem("userID");
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem("userID", id);
  }
  return id;
}

function FeatureFlagsManager({ children }: { children: React.ReactNode }) {
  const client = useConfigCatClient();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isReady) return;

    const userID = getUserID();

    // 1. Profile the user in the Error Tracer
    errorTracer.setUser(userID);

    // 2. Set the user by default in ConfigCat
    client.setDefaultUser({
      identifier: userID,
    });

    // 3. Force the ONLY download of Flags
    client.forceRefreshAsync().then(() => {
      setIsReady(true);
    });
  }, [client, isReady]);

  return <>{children}</>;
}

export function FeatureFlagsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigCatProvider
      sdkKey={process.env.NEXT_PUBLIC_CONFIG_CAT_SDK as string}
      pollingMode={PollingMode.ManualPoll}
    >
      <FeatureFlagsManager>{children}</FeatureFlagsManager>
    </ConfigCatProvider>
  );
}
