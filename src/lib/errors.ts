export type DataSource = "mock" | "supabase";

export interface SafeError {
  code: string;
  message: string;
}

export interface ServiceResponse<T> {
  data: T;
  source: DataSource;
  warning?: SafeError;
}

const DEFAULT_ERROR_MESSAGE =
  "We could not load this information right now. Please try again shortly.";

function getErrorCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return "UNEXPECTED_ERROR";
}

export function toSafeError(
  error: unknown,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
): SafeError {
  return {
    code: getErrorCode(error),
    message: fallbackMessage,
  };
}

export function mockResponse<T>(
  data: T,
  warning?: SafeError,
): ServiceResponse<T> {
  return warning
    ? { data, source: "mock", warning }
    : { data, source: "mock" };
}

export function supabaseResponse<T>(data: T): ServiceResponse<T> {
  return { data, source: "supabase" };
}
