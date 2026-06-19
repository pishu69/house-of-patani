export interface AddressFormValues {
  city: string;
  country: string;
  line1: string;
  line2: string;
  postalCode: string;
  state: string;
}

interface AddressFormProps {
  onChange?: (values: AddressFormValues) => void;
  values: AddressFormValues;
}

const addressFields = [
  { key: "line1", label: "Address line 1" },
  { key: "line2", label: "Address line 2" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "postalCode", label: "Postal code" },
  { key: "country", label: "Country" },
] as const;

export function AddressForm({ onChange, values }: AddressFormProps) {
  return (
    <fieldset>
      <legend className="font-serif text-3xl text-charcoal">
        Delivery Address
      </legend>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {addressFields.map((field) => (
          <label
            className={field.key.startsWith("line") ? "sm:col-span-2" : ""}
            key={field.key}
          >
            <span className="text-sm font-semibold">{field.label}</span>
            <input
              className="mt-2 h-11 w-full rounded-full border border-maroon/15 bg-card px-4 text-sm"
              onChange={(event) =>
                onChange?.({ ...values, [field.key]: event.target.value })
              }
              type="text"
              value={values[field.key]}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
