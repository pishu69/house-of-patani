import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportError } from "@/lib/error-monitoring";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(
      error,
      info.componentStack
        ? {
            componentStack: info.componentStack,
            source: "react-error-boundary",
          }
        : { source: "react-error-boundary" },
    );
  }

  override render() {
    if (this.state.hasError) {
      return (
        <main
          className="flex min-h-screen items-center justify-center bg-background px-4"
          role="alert"
        >
          <div className="max-w-lg text-center">
            <p className="eyebrow">House of Patani</p>
            <h1 className="mt-4 text-4xl">Something went wrong.</h1>
            <p className="mt-4 leading-7 text-muted-foreground">
              We could not complete this view. Refresh the page or return in a
              moment.
            </p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
