import {
  mockResponse,
  toSafeError,
  type ServiceResponse,
} from "@/lib/errors";

export function fallbackAfterError<T>(
  fallback: T,
  error: unknown,
  message: string,
): ServiceResponse<T> {
  return mockResponse(fallback, toSafeError(error, message));
}
