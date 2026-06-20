interface FormFieldErrorProps {
  message?: string | undefined;
}

export function FormFieldError({ message }: FormFieldErrorProps) {
  return message ? (
    <span className="mt-1 block text-xs font-medium text-destructive">
      {message}
    </span>
  ) : null;
}
