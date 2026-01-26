import { useCallback } from "react";

type DataLayerEvent = {
  event: string;
  [key: string]: unknown;
};

declare global {
  interface Window {
    dataLayer: DataLayerEvent[];
  }
}

interface UseAnalyticsReturn {
  push: (event: string, data?: Record<string, unknown>) => void;
  trackPageView: (pageName: string, pageUrl?: string) => void;
  trackClick: (elementName: string, data?: Record<string, unknown>) => void;
  trackFormSubmit: (formName: string, data?: Record<string, unknown>) => void;
  trackError: (errorMessage: string, errorCode?: string) => void;
}

export function useAnalytics(): UseAnalyticsReturn {
  const push = useCallback((event: string, data?: Record<string, unknown>) => {
    if (typeof window === "undefined") return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      ...data,
    });
  }, []);

  const trackPageView = useCallback(
    (pageName: string, pageUrl?: string) => {
      push("page_view", {
        page_name: pageName,
        page_url:
          pageUrl ||
          (typeof window !== "undefined" ? window.location.href : ""),
      });
    },
    [push],
  );

  const trackClick = useCallback(
    (elementName: string, data?: Record<string, unknown>) => {
      push("click", {
        element_name: elementName,
        ...data,
      });
    },
    [push],
  );

  const trackFormSubmit = useCallback(
    (formName: string, data?: Record<string, unknown>) => {
      push("form_submit", {
        form_name: formName,
        ...data,
      });
    },
    [push],
  );

  const trackError = useCallback(
    (errorMessage: string, errorCode?: string) => {
      push("error", {
        error_message: errorMessage,
        error_code: errorCode,
      });
    },
    [push],
  );

  return {
    push,
    trackPageView,
    trackClick,
    trackFormSubmit,
    trackError,
  };
}
