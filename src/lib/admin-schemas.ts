import { z } from "zod";

export const productFormSchema = z
  .object({
    active: z.boolean(),
    bestSeller: z.boolean(),
    category: z
      .string()
      .trim()
      .min(1, "Choose a category.")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Category must be a valid slug.",
      ),
    description: z
      .string()
      .trim()
      .min(20, "Description must be at least 20 characters.")
      .max(500, "Description must be 500 characters or fewer."),
    longDescription: z.string().trim().max(5000, "Long description must be 5000 characters or fewer."),
    details: z.string().trim().max(5000, "Details must be 5000 characters or fewer."),
    careInstructions: z.string().trim().max(3000, "Care instructions must be 3000 characters or fewer."),
    shippingReturns: z.string().trim().max(3000, "Shipping & returns must be 3000 characters or fewer."),
    attributeValues: z.record(z.string(), z.string().max(1000, "Attribute values must be 1000 characters or fewer.")),
    deliveryCodTitle: z.string().trim().max(80),
    deliveryCodDescription: z.string().trim().max(500),
    deliveryPaymentTitle: z.string().trim().max(80),
    deliveryPaymentDescription: z.string().trim().max(500),
    deliveryShippingTitle: z.string().trim().max(80),
    deliveryShippingDescription: z.string().trim().max(500),
    deliveryReturnsTitle: z.string().trim().max(80),
    deliveryReturnsDescription: z.string().trim().max(500),
    deliveryCareTitle: z.string().trim().max(80),
    deliveryCareDescription: z.string().trim().max(500),
    deliveryPackagingTitle: z.string().trim().max(80),
    deliveryPackagingDescription: z.string().trim().max(500),
    featured: z.boolean(),
    name: z
      .string()
      .trim()
      .min(3, "Product name must be at least 3 characters.")
      .max(120, "Product name must be 120 characters or fewer."),
    newArrival: z.boolean(),
    originalPrice: z
      .number()
      .min(0, "Original price cannot be negative."),
    price: z.number().min(0, "Price cannot be negative."),
    sku: z
      .string()
      .trim()
      .min(3, "SKU must be at least 3 characters.")
      .max(40, "SKU must be 40 characters or fewer.")
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "SKU may contain letters, numbers, hyphens, and underscores.",
      ),
    slug: z
      .string()
      .trim()
      .min(3, "Slug must be at least 3 characters.")
      .max(140, "Slug must be 140 characters or fewer.")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers, and single hyphens.",
      ),
    stock: z
      .number()
      .int("Stock must be a whole number.")
      .min(0, "Stock cannot be negative."),
    shippingWeightKg: z
      .number()
      .positive("Shipping weight must be greater than zero."),
    packageLengthCm: z
      .number()
      .positive("Package length must be greater than zero."),
    packageBreadthCm: z
      .number()
      .positive("Package breadth must be greater than zero."),
    packageHeightCm: z
      .number()
      .positive("Package height must be greater than zero."),
      lowStockThreshold: z
  .number()
  .int("Low stock alert must be a whole number.")
  .min(0, "Low stock alert cannot be negative."),
trackInventory: z.boolean(),
allowBackorder: z.boolean(),
    tags: z.string().max(300, "Tags must be 300 characters or fewer."),
    warehouseId: z
      .string()
      .uuid("Choose a valid fulfillment warehouse.")
      .or(z.literal(""))
      .nullable()
      .optional(),
  })
  .refine((value) => value.originalPrice >= value.price, {
    message: "Original price must be equal to or greater than price.",
    path: ["originalPrice"],
  });

export type ProductFormValues = z.input<typeof productFormSchema>;

export const productMediaSchema = z.array(
  z.object({
    altText: z
      .string()
      .trim()
      .min(2, "Every product image needs descriptive alt text.")
      .max(160, "Image alt text must be 160 characters or fewer."),
    id: z.string().min(1),
    isPrimary: z.boolean(),
    position: z.number().int().min(0),
    storagePath: z.string().nullable(),
    url: z.string().min(1),
  }),
);

export const couponFormSchema = z
  .object({
    active: z.boolean(),
    code: z
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters.")
      .max(30, "Code must be 30 characters or fewer.")
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Use letters, numbers, hyphens, and underscores.",
      ),
    expiresAt: z.string(),
    minimumOrderValue: z
      .number()
      .min(0, "Minimum order value cannot be negative."),
    type: z.enum(["fixed", "percentage"]),
    usageLimit: z
      .number()
      .int("Usage limit must be a whole number.")
      .min(0, "Usage limit cannot be negative."),
    value: z.number().positive("Discount value must be greater than zero."),
  })
  .refine(
    (coupon) => coupon.type !== "percentage" || coupon.value <= 100,
    {
      message: "Percentage discount cannot exceed 100%.",
      path: ["value"],
    },
  )
  .refine(
    (coupon) =>
      !coupon.expiresAt ||
      new Date(`${coupon.expiresAt}T23:59:59`).getTime() >= Date.now(),
    {
      message: "Expiry date cannot be in the past.",
      path: ["expiresAt"],
    },
  );

export type CouponFormValues = z.input<typeof couponFormSchema>;

export const settingsFormSchema = z
  .object({
    address: z.string().trim().min(5, "Enter the store address."),
    codEnabled: z.boolean(),
    email: z.string().trim().email("Enter a valid email address."),
    facebook: z
      .string()
      .trim()
      .url("Enter a valid Facebook URL.")
      .or(z.literal("")),
    freeShippingThreshold: z
      .number()
      .min(0, "Threshold cannot be negative."),
    homepageBanner: z
      .string()
      .trim()
      .url("Enter a valid banner URL.")
      .or(z.literal("")),
    homepageBannerPath: z.string(),
    heroSubtitle: z.string().trim().min(2, "Enter a hero subtitle."),
    heroTitle: z.string().trim().min(2, "Enter a hero title."),
    heroDescription: z.string().trim().min(10, "Enter a hero description."),
    heroQuote: z.string().trim().min(2, "Enter a hero quote."),
    aboutHeroEyebrow: z.string().trim().min(2, "Enter about eyebrow."),
    aboutHeroTitle: z.string().trim().min(2, "Enter about title."),
    aboutHeroDescription: z.string().trim().min(10, "Enter about description."),
    heritageEyebrow: z.string().trim().min(2, "Enter heritage eyebrow."),
    heritageTitle: z.string().trim().min(2, "Enter heritage title."),
    heritageDescription: z.string().trim().min(10, "Enter heritage description."),
    artisanEyebrow: z.string().trim().min(2, "Enter artisan eyebrow."),
    artisanTitle: z.string().trim().min(2, "Enter artisan title."),
    artisanDescription: z.string().trim().min(10, "Enter artisan description."),
    deliveryCodTitle: z.string().trim().min(2, "Enter COD title."),
    deliveryCodDescription: z.string().trim().min(5, "Enter COD description."),
    deliveryPaymentTitle: z.string().trim().min(2, "Enter payment title."),
    deliveryPaymentDescription: z.string().trim().min(5, "Enter payment description."),
    deliveryShippingTitle: z.string().trim().min(2, "Enter shipping title."),
    deliveryShippingDescription: z.string().trim().min(5, "Enter shipping description."),
    deliveryReturnsTitle: z.string().trim().min(2, "Enter returns title."),
    deliveryReturnsDescription: z.string().trim().min(5, "Enter returns description."),
    deliveryCareTitle: z.string().trim().min(2, "Enter care title."),
    deliveryCareDescription: z.string().trim().min(5, "Enter care description."),
    deliveryPackagingTitle: z.string().trim().min(2, "Enter packaging title."),
    deliveryPackagingDescription: z.string().trim().min(5, "Enter packaging description."),
    instagram: z
      .string()
      .trim()
      .url("Enter a valid Instagram URL.")
      .or(z.literal("")),
    logoPath: z.string(),
    logoUrl: z
      .string()
      .trim()
      .url("Enter a valid logo URL.")
      .or(z.literal("")),
    razorpayEnabled: z.boolean(),
    shippingCharge: z
      .number()
      .min(0, "Shipping charge cannot be negative."),
    storeName: z.string().trim().min(2, "Enter the store name."),
    whatsappNumber: z
      .string()
      .trim()
      .min(8, "Enter a valid WhatsApp number.")
      .max(20, "WhatsApp number is too long."),
  })
  .refine(
    (settings) =>
      !settings.razorpayEnabled ||
      settings.email.toLowerCase().includes("@"),
    {
      message: "A valid support email is required.",
      path: ["email"],
    },
  );

export type SettingsFormValues = z.input<typeof settingsFormSchema>;




