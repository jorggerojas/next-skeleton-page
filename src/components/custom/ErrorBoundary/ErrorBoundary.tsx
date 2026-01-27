"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
}

const isDev = process.env.NODE_ENV !== "production";

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    this.handleReset();
    window.location.reload();
  };

  renderDevError() {
    const { error, errorInfo } = this.state;

    return (
      <div className="min-h-screen bg-red-50 p-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 rounded-lg bg-red-100 border border-red-300 p-4">
            <h1 className="text-xl font-bold text-red-800 mb-2">
              Error in Development Mode
            </h1>
            <p className="text-red-700 font-mono text-sm">
              {error?.name}: {error?.message}
            </p>
          </div>

          {error?.stack && (
            <div className="mb-4 rounded-lg bg-gray-900 p-4 overflow-auto">
              <h2 className="text-sm font-semibold text-gray-400 mb-2">
                Stack Trace
              </h2>
              <pre className="text-xs text-red-400 whitespace-pre-wrap font-mono">
                {error.stack}
              </pre>
            </div>
          )}

          {errorInfo?.componentStack && (
            <div className="mb-4 rounded-lg bg-gray-900 p-4 overflow-auto">
              <h2 className="text-sm font-semibold text-gray-400 mb-2">
                Component Stack
              </h2>
              <pre className="text-xs text-yellow-400 whitespace-pre-wrap font-mono">
                {errorInfo.componentStack}
              </pre>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 text-sm"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 text-sm"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  renderProdError() {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Something went wrong</h1>
          <p className="mb-4 text-gray-600">
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return isDev ? this.renderDevError() : this.renderProdError();
    }

    return this.props.children;
  }
}
