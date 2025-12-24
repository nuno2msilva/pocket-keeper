import { useState } from "react";
import { Plus, Grid3X3, Pencil, Trash2, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { CategoryDialog } from "@/components/categories/CategoryDialog";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";
import { useCategories, useSubcategories, useProducts } from "@/hooks/useLocalStorage";
import { Category } from "@/types/expense";
import { toast } from "sonner";

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { subcategories, getSubcategoriesByCategory } = useSubcategories();
  const { products } = useProducts();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const getCategoryStats = (categoryId: string) => {
    const categoryProducts = products.filter(p => p.categoryId === categoryId);
    const subcats = getSubcategoriesByCategory(categoryId);
    return { productCount: categoryProducts.length, subcategoryCount: subcats.length };
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleSave = (data: Omit<Category, "id">) => {
    if (selectedCategory) {
      updateCategory(selectedCategory.id, data);
      toast.success("Category updated");
    } else {
      addCategory(data);
      toast.success("Category created");
    }
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      deleteCategory(selectedCategory.id);
      toast.success("Category deleted");
      setDeleteDialogOpen(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Categories" 
        subtitle={`${categories.length} categories`}
        action={
          <Button size="icon" variant="default" onClick={handleAdd}>
            <Plus className="w-5 h-5" />
          </Button>
        }
      />

      <div className="p-4">
        {categories.length === 0 ? (
          <EmptyState
            icon={<Grid3X3 className="w-8 h-8 text-muted-foreground" />}
            title="No categories yet"
            description="Create categories to organize your expenses"
            actionLabel="Add Category"
            onAction={handleAdd}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {categories.map(category => {
              const stats = getCategoryStats(category.id);
              
              return (
                <div
                  key={category.id}
                  className="relative flex flex-col items-center p-5 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 animate-fade-in"
                >
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(category)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon}
                  </div>
                  <h3 className="text-body font-semibold text-foreground mb-1">
                    {category.name}
                  </h3>
                  <p className="text-caption text-muted-foreground">
                    {stats.productCount} product{stats.productCount !== 1 ? "s" : ""}
                  </p>
                  {stats.subcategoryCount > 0 && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      {stats.subcategoryCount} subcategory{stats.subcategoryCount !== 1 ? "s" : ""}
                      <ChevronRight className="w-3 h-3" />
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Category"
        description={`Are you sure you want to delete "${selectedCategory?.name}"? This won't delete associated products.`}
        onConfirm={confirmDelete}
      />
    </AppLayout>
  );
}
