import type {
  FieldValues,
  Path,
  UseFormSetError,
} from "react-hook-form";
import type { ZodIssue } from "zod";

export function applyZodErrors<T extends FieldValues>(
  issues: ZodIssue[],
  setError: UseFormSetError<T>,
) {
  issues.forEach((issue) => {
    const field = issue.path[0];

    if (typeof field === "string") {
      setError(field as Path<T>, {
        message: issue.message,
        type: "validation",
      });
    }
  });
}
