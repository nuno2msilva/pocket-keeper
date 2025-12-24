import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Grid3X3, ChevronRight, Search, X } from "lucide-react";
import {
  AppLayout,
  PageHeader,
  EmptyState,
  useCategories,
  useSubcategories,
  useProducts,
} from "@/features/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { getSubcategoriesByCategory } = useSubcategories();
  const { products } = useProducts();

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const getCategoryStats = (categoryId: string) => {
    const categoryProducts = products.filter((p) => p.categoryId === categoryId);
    const subcats = getSubcategoriesByCategory(categoryId);
    return { productCount: categoryProducts.length, subcategoryCount: subcats.length };
  };

  // Filter categories
  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    const query = search.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(query));
  }, [categories, search]);

  return (
    <AppLayout>
      <PageHeader title="Categories" subtitle={`${categories.length} categories`} />

      {/* Search toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background/50">
        {showSearch ? (
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="pl-9 h-9"
                autoFocus
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setSearch("")}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSearch(false);
                setSearch("");
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowSearch(true)}
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </Button>
            <div className="flex-1" />
          </>
        )}
      </div>

      <div className="p-4">
        {categories.length === 0 ? (
          <EmptyState
            icon={<Grid3X3 className="w-8 h-8 text-muted-foreground" />}
            title="No categories"
            description="Categories will appear here"
          />
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            icon={<Grid3X3 className="w-8 h-8 text-muted-foreground" />}
            title="No matches"
            description="Try adjusting your search"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredCategories.map((category) => {
              const stats = getCategoryStats(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => navigate(`/categories/${category.id}`)}
                  className="relative flex flex-col items-center p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 text-center min-h-[120px]"
                  aria-label={`View ${category.name} category with ${stats.productCount} products`}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-0.5 truncate max-w-full">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {stats.productCount} product{stats.productCount !== 1 ? "s" : ""}
                  </p>
                  {stats.subcategoryCount > 0 && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                      {stats.subcategoryCount} subcategor{stats.subcategoryCount !== 1 ? "ies" : "y"}
                      <ChevronRight className="w-3 h-3" />
                    </p>
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
