import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import { categoryQueryKeys, useCategories } from "@/hooks";
import { categoryService } from "@/services";

export function CategoryMediaManager() {
  const queryClient = useQueryClient();
  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data?.data ?? [];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => (
        <article
          className="rounded-lg border border-maroon/10 bg-background p-4"
          key={category.slug}
        >
          <h3 className="text-xl">{category.name}</h3>
          <div className="mt-3">
            <SingleImageUploader
              alt={`${category.name} category`}
              bucket="category-images"
              folder={category.slug}
              label={`${category.name} image`}
              onChange={async (url, path) => {
                const response = await categoryService.updateImage(
                  category.slug,
                  url,
                  path,
                );
                await queryClient.invalidateQueries({
                  queryKey: categoryQueryKeys.all,
                });
                if (response.warning) toast.warning(response.warning.message);
              }}
              path={category.imagePath}
              url={category.imageUrl}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
