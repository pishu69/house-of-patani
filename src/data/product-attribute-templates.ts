export type ProductAttributeFieldType =
  | "text"
  | "number"
  | "textarea"
  | "select";

export type ProductAttributeOption = {
  label: string;
  value: string;
};

export type ProductAttributeField = {
  key: string;
  label: string;
  type?: ProductAttributeFieldType;
  placeholder?: string;
  options?: ProductAttributeOption[];
};

export type ProductAttributeValue = {
  key: string;
  label: string;
  value: string;
};

export const productAttributeTemplates: Record<string, ProductAttributeField[]> = {
  clothing: [
    { key: "fabric", label: "Fabric", type: "text", placeholder: "Cotton, Silk, Handloom..." },
    { key: "color", label: "Color", type: "text", placeholder: "Yellow, Green..." },
    { key: "size", label: "Size", type: "text", placeholder: "S, M, L, XL or Free Size" },
    { key: "fit", label: "Fit", type: "text", placeholder: "Regular, Slim, Relaxed..." },
    { key: "occasion", label: "Occasion", type: "text", placeholder: "Festival, Daily Wear..." },
    { key: "care", label: "Care", type: "textarea", placeholder: "Hand wash, Dry clean..." },
  ],

  books: [
    { key: "author", label: "Author", type: "text", placeholder: "Author name" },
    { key: "publisher", label: "Publisher", type: "text", placeholder: "Publisher name" },
    { key: "language", label: "Language", type: "text", placeholder: "English, Bengali, Assamese..." },
    { key: "isbn", label: "ISBN", type: "text", placeholder: "Book ISBN number" },
    { key: "pages", label: "Pages", type: "number", placeholder: "Number of pages" },
    {
      key: "binding",
      label: "Binding",
      type: "select",
      placeholder: "Select binding",
      options: [
        { label: "Paperback", value: "Paperback" },
        { label: "Hardcover", value: "Hardcover" },
      ],
    },
    { key: "edition", label: "Edition", type: "text", placeholder: "First Edition, Second Edition..." },
  ],

  jewelry: [
    { key: "material", label: "Material", type: "text", placeholder: "Gold, Silver, Brass..." },
    { key: "stone", label: "Stone", type: "text", placeholder: "Pearl, Crystal, No stone..." },
    { key: "weight", label: "Weight", type: "text", placeholder: "Example: 20g" },
    { key: "size", label: "Size", type: "text", placeholder: "Adjustable, 7 inch..." },
  ],

  handicrafts: [
    { key: "material", label: "Material", type: "text", placeholder: "Bamboo, Wood, Clay..." },
    { key: "artisan", label: "Artisan", type: "text", placeholder: "Artisan name or community" },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "Example: 10 x 8 inch" },
    { key: "technique", label: "Technique", type: "text", placeholder: "Handmade, Woven, Painted..." },
  ],

  "home-decor": [
    { key: "material", label: "Material", type: "text", placeholder: "Wood, Bamboo, Metal..." },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "Example: 12 x 10 inch" },
    { key: "room", label: "Room", type: "text", placeholder: "Living Room, Bedroom..." },
    { key: "care", label: "Care", type: "textarea", placeholder: "Clean with dry cloth..." },
  ],

  accessories: [
    { key: "material", label: "Material", type: "text", placeholder: "Cotton, Leather, Metal..." },
    { key: "size", label: "Size", type: "text", placeholder: "Small, Medium, Large..." },
    { key: "usage", label: "Usage", type: "text", placeholder: "Daily use, Festival, Gift..." },
  ],
};

export function getProductAttributeTemplate(categorySlug?: string | null) {
  if (!categorySlug) return [];
  return productAttributeTemplates[categorySlug] ?? [];
}

export function buildProductAttributes(
  categorySlug: string | null | undefined,
  values: Record<string, string>,
): ProductAttributeValue[] {
  return getProductAttributeTemplate(categorySlug)
    .map((field) => ({
      key: field.key,
      label: field.label,
      value: values[field.key]?.trim() ?? "",
    }))
    .filter((attribute) => attribute.value.length > 0);
}

export function productAttributesToRecord(
  attributes?: ProductAttributeValue[] | null,
): Record<string, string> {
  if (!attributes) return {};

  return attributes.reduce<Record<string, string>>((record, attribute) => {
    record[attribute.key] = attribute.value;
    return record;
  }, {});
}
