export interface ContactFormValues {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface ContactFormProps {
  onChange?: (values: ContactFormValues) => void;
  values: ContactFormValues;
}

const contactFields = [
  { key: "firstName", label: "First name", type: "text" },
  { key: "lastName", label: "Last name", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "tel" },
] as const;

export function ContactForm({ onChange, values }: ContactFormProps) {
  return (
    <fieldset>
      <legend className="font-serif text-3xl text-charcoal">
        Contact Information
      </legend>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {contactFields.map((field) => (
          <label key={field.key}>
            <span className="text-sm font-semibold">{field.label}</span>
            <input
              className="mt-2 h-11 w-full rounded-full border border-maroon/15 bg-card px-4 text-sm"
              onChange={(event) =>
                onChange?.({ ...values, [field.key]: event.target.value })
              }
              type={field.type}
              value={values[field.key]}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
