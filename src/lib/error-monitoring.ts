export interface ErrorContext {
  componentStack?: string;
  source?: string;
}

export type ErrorReporter = (
  error: Error,
  context?: ErrorContext,
) => void | Promise<void>;

let reporter: ErrorReporter | null = null;

export function configureErrorReporter(nextReporter: ErrorReporter) {
  reporter = nextReporter;
}

export function reportError(error: unknown, context?: ErrorContext) {
  const normalizedError =
    error instanceof Error ? error : new Error("Unknown application error");

  if (reporter) {
    void reporter(normalizedError, context);
    return;
  }

  if (import.meta.env.DEV) {
    console.error(normalizedError, context);
  }
}
