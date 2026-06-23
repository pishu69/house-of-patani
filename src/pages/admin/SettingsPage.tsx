import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  AdminSourceBadge,
  CategoryMediaManager,
  DashboardCard,
  FormFieldError,
  PageTitle,
  SingleImageUploader,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { settingsQueryKeys, useSettings } from "@/hooks";
import {
  settingsFormSchema,
  type SettingsFormValues,
} from "@/lib/admin-schemas";
import { applyZodErrors } from "@/lib/form-validation";
import { settingService } from "@/services";

const inputClassName =
  "mt-2 h-11 w-full rounded-md border border-maroon/15 bg-background px-3 text-sm text-charcoal";
const textareaClassName =
  "mt-2 min-h-28 w-full resize-y rounded-md border border-maroon/15 bg-background px-3 py-3 text-sm text-charcoal";

const defaults: SettingsFormValues = {
  address: "",
  codEnabled: true,
  email: "",
  facebook: "",
  freeShippingThreshold: 0,
  homepageBanner: "",
  homepageBannerPath: "",
  heroSubtitle: "",
  heroTitle: "",
  heroDescription: "",
  heroQuote: "",
  aboutHeroEyebrow: "",
  aboutHeroTitle: "",
  aboutHeroDescription: "",
  heritageEyebrow: "",
  heritageTitle: "",
  heritageDescription: "",
  artisanEyebrow: "",
  artisanTitle: "",
  artisanDescription: "",
  instagram: "",
  logoPath: "",
  logoUrl: "",
  razorpayEnabled: false,
  shippingCharge: 0,
  storeName: "",
  whatsappNumber: "",
};

export function SettingsPage() {
  const queryClient = useQueryClient();
  const settingsQuery = useSettings();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<SettingsFormValues>({ defaultValues: defaults });
  const homepageBanner = watch("homepageBanner");
  const homepageBannerPath = watch("homepageBannerPath");
  const logoUrl = watch("logoUrl");
  const logoPath = watch("logoPath");

  useEffect(() => {
    if (settingsQuery.data?.data) reset(settingsQuery.data.data);
  }, [reset, settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: settingService.update,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: settingsQueryKeys.all });
      toast.success("Settings saved.", {
        description: response.warning?.message,
      });
    },
    onError: () => toast.error("The settings could not be saved."),
  });

  function submitForm(values: SettingsFormValues) {
    const result = settingsFormSchema.safeParse(values);

    if (!result.success) {
      applyZodErrors(result.error.issues, setError);
      return;
    }

    saveMutation.mutate(result.data);
  }

  return (
    <form
      className="space-y-6"
      noValidate
      onSubmit={handleSubmit(submitForm)}
    >
      <PageTitle
        action={
          <Button disabled={saveMutation.isPending} type="submit">
            <Save aria-hidden="true" size={17} />
            {saveMutation.isPending ? "Saving..." : "Save settings"}
          </Button>
        }
        description="Manage store identity, social channels, shipping, and payment availability."
        title="Settings"
      />

      <div className="flex justify-end">
        <AdminSourceBadge source={settingsQuery.data?.source} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardCard
          description="Identity and contact details used across the store."
          title="Store profile"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-charcoal">
              Store name
              <input className={inputClassName} {...register("storeName")} />
              <FormFieldError message={errors.storeName?.message} />
            </label>
            <label className="text-sm font-medium text-charcoal">
              Support email
              <input
                className={inputClassName}
                type="email"
                {...register("email")}
              />
              <FormFieldError message={errors.email?.message} />
            </label>
            <label className="text-sm font-medium text-charcoal">
              WhatsApp number
              <input
                className={inputClassName}
                type="tel"
                {...register("whatsappNumber")}
              />
              <FormFieldError message={errors.whatsappNumber?.message} />
            </label>
            <label className="text-sm font-medium text-charcoal sm:col-span-2">
              Store address
              <textarea className={textareaClassName} {...register("address")} />
              <FormFieldError message={errors.address?.message} />
            </label>
          </div>
        </DashboardCard>

        <DashboardCard
          description="Text shown on the main homepage banner."
          title="Homepage hero"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-charcoal">
              Hero subtitle
              <input className={inputClassName} {...register("heroSubtitle")} />
              <FormFieldError message={errors.heroSubtitle?.message} />
            </label>
            <label className="text-sm font-medium text-charcoal">
              Hero title
              <input className={inputClassName} {...register("heroTitle")} />
              <FormFieldError message={errors.heroTitle?.message} />
            </label>
            <label className="text-sm font-medium text-charcoal sm:col-span-2">
              Hero description
              <textarea
                className={textareaClassName}
                {...register("heroDescription")}
              />
              <FormFieldError message={errors.heroDescription?.message} />
            </label>
            <label className="text-sm font-medium text-charcoal sm:col-span-2">
              Hero quote
              <input className={inputClassName} {...register("heroQuote")} />
              <FormFieldError message={errors.heroQuote?.message} />
            </label>
          </div>
        </DashboardCard>
        <DashboardCard
          description="Links shown across brand and customer touchpoints."
          title="Social channels"
        >
          <div className="space-y-4">
            <label className="text-sm font-medium text-charcoal">
              Instagram URL
              <input className={inputClassName} {...register("instagram")} />
              <FormFieldError message={errors.instagram?.message} />
            </label>
            <label className="text-sm font-medium text-charcoal">
              Facebook URL
              <input className={inputClassName} {...register("facebook")} />
              <FormFieldError message={errors.facebook?.message} />
            </label>
          </div>
        </DashboardCard>

        <DashboardCard
          description="Defaults used when calculating delivery costs."
          title="Shipping"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-charcoal">
              Shipping charge
              <input
                className={inputClassName}
                min="0"
                step="0.01"
                type="number"
                {...register("shippingCharge", { valueAsNumber: true })}
              />
              <FormFieldError message={errors.shippingCharge?.message} />
            </label>
            <label className="text-sm font-medium text-charcoal">
              Free shipping threshold
              <input
                className={inputClassName}
                min="0"
                step="0.01"
                type="number"
                {...register("freeShippingThreshold", {
                  valueAsNumber: true,
                })}
              />
              <FormFieldError
                message={errors.freeShippingThreshold?.message}
              />
            </label>
          </div>
        </DashboardCard>

        <DashboardCard
          description="Availability flags only; payment processing is not connected."
          title="Payments"
        >
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-4 rounded-md border border-maroon/10 bg-background px-4 py-3 text-sm font-medium text-charcoal">
              Cash on delivery
              <input
                className="h-4 w-4 accent-maroon"
                type="checkbox"
                {...register("codEnabled")}
              />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-md border border-maroon/10 bg-background px-4 py-3 text-sm font-medium text-charcoal">
              <span>
                Razorpay
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  Placeholder
                </span>
              </span>
              <input
                className="h-4 w-4 accent-maroon"
                type="checkbox"
                {...register("razorpayEnabled")}
              />
            </label>
          </div>
        </DashboardCard>

        <DashboardCard
          className="xl:col-span-2"
          description="The main image shown behind the homepage introduction."
          title="Homepage banner"
        >
          <SingleImageUploader
            alt="Homepage heritage banner"
            bucket="banner-images"
            folder="homepage"
            label="Upload homepage banner"
            onChange={(url, path) => {
              setValue("homepageBanner", url, { shouldDirty: true });
              setValue("homepageBannerPath", path ?? "", {
                shouldDirty: true,
              });
            }}
            path={homepageBannerPath || null}
            url={homepageBanner}
          />
          <input type="hidden" {...register("homepageBanner")} />
          <input type="hidden" {...register("homepageBannerPath")} />
          <FormFieldError message={errors.homepageBanner?.message} />
        </DashboardCard>

        <DashboardCard
          className="xl:col-span-2"
          description="Optional store mark for future branded surfaces."
          title="Store logo"
        >
          <SingleImageUploader
            alt="House of Patani logo"
            bucket="store-assets"
            folder="logo"
            label="Upload store logo"
            onChange={(url, path) => {
              setValue("logoUrl", url, { shouldDirty: true });
              setValue("logoPath", path ?? "", { shouldDirty: true });
            }}
            path={logoPath || null}
            url={logoUrl}
          />
          <input type="hidden" {...register("logoUrl")} />
          <input type="hidden" {...register("logoPath")} />
          <FormFieldError message={errors.logoUrl?.message} />
        </DashboardCard>

        <DashboardCard
          className="xl:col-span-2"
          description="Artwork used by category cards across the storefront."
          title="Category images"
        >
          <CategoryMediaManager />
        </DashboardCard>
      </div>
    </form>
  );
}



