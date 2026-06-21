import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AdminSourceBadge,
  DashboardCard,
  EmptyAdminState,
  PageTitle,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { categoryQueryKeys, useCategories } from "@/hooks";
import { categoryService } from "@/services";
import type { ShopCategory } from "@/data/categories";
import { generateSlug } from "@/utils";

const inputClassName =
  "mt-2 h-11 w-full rounded-md border border-maroon/15 bg-background px-3 text-sm text-charcoal";
const textareaClassName =
  "mt-2 min-h-24 w-full resize-y rounded-md border border-maroon/15 bg-background px-3 py-3 text-sm text-charcoal";

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data?.data ?? [];

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<ShopCategory | null>(
    null,
  );

  function resetForm() {
    setEditingSlug(null);
    setName("");
    setSlug("");
    setDescription("");
  }

  function editCategory(category: ShopCategory) {
    setEditingSlug(category.slug);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const cleanName = name.trim();
      const cleanSlug = generateSlug(slug || name);
      const cleanDescription = description.trim();

      if (!cleanName || !cleanSlug) {
        throw new Error("Name and slug are required.");
      }

      if (editingSlug) {
        return categoryService.update(editingSlug, {
          description: cleanDescription,
          name: cleanName,
          slug: cleanSlug,
        });
      }

      return categoryService.create({
        description: cleanDescription,
        name: cleanName,
        slug: cleanSlug,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      toast.success(editingSlug ? "Category updated." : "Category created.");
      resetForm();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Category could not be saved.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (category: ShopCategory) => categoryService.remove(category.slug),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      toast.success("Category deleted.");
      setCategoryToDelete(null);
    },
    onError: () => toast.error("Category could not be deleted."),
  });

  return (
    <div className="space-y-6">
      <PageTitle
        action={
          <Button onClick={resetForm} type="button">
            <Plus aria-hidden="true" size={17} />
            Add category
          </Button>
        }
        description="Manage collection categories shown across the storefront."
        title="Categories"
      />

      <div className="flex justify-end">
        <AdminSourceBadge source={categoriesQuery.data?.source} />
      </div>

      <DashboardCard
        description="Create or edit category name, slug, and description."
        title={editingSlug ? "Edit category" : "Add category"}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-charcoal">
            Category name
            <input
              className={inputClassName}
              onChange={(event) => {
                setName(event.target.value);
                if (!editingSlug) setSlug(generateSlug(event.target.value));
              }}
              value={name}
            />
          </label>

          <label className="text-sm font-medium text-charcoal">
            Slug
            <input
              className={inputClassName}
              onChange={(event) => setSlug(generateSlug(event.target.value))}
              value={slug}
            />
          </label>

          <label className="text-sm font-medium text-charcoal md:col-span-2">
            Description
            <textarea
              className={textareaClassName}
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()} type="button">
            <Save aria-hidden="true" size={17} />
            {saveMutation.isPending ? "Saving..." : "Save category"}
          </Button>

          {editingSlug ? (
            <Button onClick={resetForm} type="button" variant="outline">
              Cancel edit
            </Button>
          ) : null}
        </div>
      </DashboardCard>

      <DashboardCard
        description="Existing categories currently available in the store."
        title="Category list"
      >
        {categoriesQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading categories...</p>
        ) : categories.length > 0 ? (
          <div className="grid gap-3">
            {categories.map((category) => (
              <div
                className="flex flex-col gap-4 rounded-lg border border-maroon/10 bg-background p-4 md:flex-row md:items-center md:justify-between"
                key={category.slug}
              >
                <div className="flex items-center gap-4">
                  {category.imageUrl ? (
                    <img
                      alt=""
                      className="h-14 w-14 rounded-md object-cover"
                      src={category.imageUrl}
                    />
                  ) : (
                    <span className="h-14 w-14 rounded-md bg-linen" />
                  )}

                  <div>
                    <p className="font-semibold text-charcoal">
                      {category.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {category.slug}
                    </p>
                    <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                      {category.description || "No description added."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => editCategory(category)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Pencil aria-hidden="true" size={15} />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setCategoryToDelete(category)}
                    size="sm"
                    type="button"
                    variant="destructive"
                  >
                    <Trash2 aria-hidden="true" size={15} />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyAdminState
            description="Create your first category to organize products."
            title="No categories yet"
          />
        )}
      </DashboardCard>

      {categoryToDelete ? (
        <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Delete category "{categoryToDelete.name}"?
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(categoryToDelete)}
              type="button"
              variant="destructive"
            >
              Confirm delete
            </Button>
            <Button
              onClick={() => setCategoryToDelete(null)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
