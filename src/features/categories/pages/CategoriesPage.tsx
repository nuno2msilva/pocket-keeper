import { useNavigate } from "react-router-dom";
import { Grid3X3, ChevronRight } from "lucide-react";
import { AppLayout, PageHeader, EmptyState, useCategories, useSubcategories, useProducts } from "@/features/shared";

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { getSubcategoriesByCategory } = useSubcategories();
  const { products } = useProducts();

  const getCategoryStats = (categoryId: string) => {
    const categoryProducts = products.filter((p) => p.categoryId === categoryId);
    const subcats = getSubcategoriesByCategory(categoryId);
    return { productCount: categoryProducts.length, subcategoryCount: subcats.length };
  };

  return (
    <AppLayout>
      <PageHeader title="Categories" subtitle={`${categories.length} categories`} />

      <div className="p-4">
        {categories.length === 0 ? (
          <EmptyState icon={<Grid3X3 className="w-8 h-8 text-muted-foreground" />} title="No categories" description="Categories will appear here" />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => {
              const stats = getCategoryStats(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => navigate(`/categories/${category.id}`)}
                  className="relative flex flex-col items-center p-5 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 animate-fade-in text-center min-h-[140px]"
                  aria-label={`View ${category.name} category with ${stats.productCount} products`}
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3" style={{ backgroundColor: `${category.color}20` }}>{category.icon}</div>
                  <h3 className="text-body font-semibold text-foreground mb-1">{category.name}</h3>
                  <p className="text-caption text-muted-foreground">{stats.productCount} product{stats.productCount !== 1 ? "s" : ""}</p>
                  {stats.subcategoryCount > 0 && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">{stats.subcategoryCount} subcategor{stats.subcategoryCount !== 1 ? "ies" : "y"}<ChevronRight className="w-3 h-3" /></p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
