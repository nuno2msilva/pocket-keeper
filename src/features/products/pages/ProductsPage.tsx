import { useState, useMemo } from "react";
import { Plus, Package } from "lucide-react";
import {
  AppLayout,
  PageHeader,
  EmptyState,
  DeleteConfirmDialog,
  ListCard,
  ListToolbar,
  useProducts,
  useCategories,
  useSubcategories,
  Product,
  SortOption,
  FilterOption,
} from "@/features/shared";
import { Button } from "@/components/ui/button";
import { ProductDialog } from "../components/ProductDialog";
import { toast } from "sonner";

const SORT_OPTIONS: SortOption[] = [
  { id: "name", label: "Name" },
  { id: "price", label: "Price" },
  { id: "category", label: "Category" },
  { id: "review", label: "Needs Review" },
];

export default function ProductsPage() {
  const { products, updateProduct, deleteProduct, addProduct } = useProducts();
  const { categories } = useCategories();
  const { subcategories, addSubcategory } = useSubcategories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter & sort state
  const [search, setSearch] = useState("");
  const [currentSort, setCurrentSort] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const getCategory = (categoryId?: string) =>
    categoryId ? categories.find((c) => c.id === categoryId) : undefined;
  const getSubcategory = (subcategoryId?: string) =>
    subcategoryId ? subcategories.find((s) => s.id === subcategoryId) : undefined;

  // Build filter options from categories
  const filterOptions: FilterOption[] = useMemo(() => {
    const categoryFilters = categories.map((c) => ({
      id: `cat:${c.id}`,
      label: `${c.icon} ${c.name}`,
      group: "Category",
    }));
    return [
      { id: "needs-review", label: "Needs Review", group: "Status" },
      { id: "uncategorized", label: "Uncategorized", group: "Status" },
      ...categoryFilters,
    ];
  }, [categories]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(query));
    }

    // Apply filters
    if (activeFilters.length > 0) {
      result = result.filter((product) => {
        return activeFilters.some((filter) => {
          if (filter === "needs-review") {
            return !product.categoryId || !product.isSolidified;
          }
          if (filter === "uncategorized") {
            return !product.categoryId;
          }
          if (filter.startsWith("cat:")) {
            return product.categoryId === filter.replace("cat:", "");
          }
          return true;
        });
      });
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (currentSort) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          comparison = (a.defaultPrice || 0) - (b.defaultPrice || 0);
          break;
        case "category":
          const catA = getCategory(a.categoryId)?.name || "zzz";
          const catB = getCategory(b.categoryId)?.name || "zzz";
          comparison = catA.localeCompare(catB);
          break;
        case "review":
          const needsA = !a.categoryId || !a.isSolidified ? 0 : 1;
          const needsB = !b.categoryId || !b.isSolidified ? 0 : 1;
          comparison = needsA - needsB;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [products, search, activeFilters, currentSort, sortDirection, categories]);

  const handleAdd = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleSave = (data: Omit<Product, "id">) => {
    if (selectedProduct) {
      updateProduct(selectedProduct.id, { ...data, isSolidified: true });
      toast.success("Product updated");
    } else {
      addProduct({ ...data, isSolidified: true });
      toast.success("Product created");
    }
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteProduct(selectedProduct.id);
      toast.success("Product deleted");
      setDeleteDialogOpen(false);
    }
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  return (
    <AppLayout>
      <PageHeader
        title="Products"
        subtitle={`${products.length} tracked`}
        action={
          <Button size="icon" variant="default" onClick={handleAdd} aria-label="Add product">
            <Plus className="w-5 h-5" />
          </Button>
        }
      />

      <ListToolbar
        searchPlaceholder="Search products..."
        searchValue={search}
        onSearchChange={setSearch}
        sortOptions={SORT_OPTIONS}
        currentSort={currentSort}
        onSortChange={setCurrentSort}
        sortDirection={sortDirection}
        onSortDirectionChange={() => setSortDirection((d) => (d === "asc" ? "desc" : "asc"))}
        filterOptions={filterOptions}
        activeFilters={activeFilters}
        onFilterChange={toggleFilter}
        onClearFilters={() => setActiveFilters([])}
      />

      <div className="p-4 space-y-3">
        {products.length === 0 ? (
          <EmptyState
            icon={<Package className="w-8 h-8 text-muted-foreground" />}
            title="No products yet"
            description="Products are created automatically when you add them to receipts"
            actionLabel="Add Product"
            onAction={handleAdd}
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={<Package className="w-8 h-8 text-muted-foreground" />}
            title="No matches"
            description="Try adjusting your search or filters"
          />
        ) : (
          filteredProducts.map((product) => {
            const category = getCategory(product.categoryId);
            const subcategory = getSubcategory(product.subcategoryId);
            const needsReview = !product.categoryId || !product.isSolidified;

            return (
              <ListCard
                key={product.id}
                icon={category?.icon || "📦"}
                iconBg={category?.color ? `${category.color}20` : undefined}
                title={product.name}
                badge={needsReview ? { label: "Review", variant: "warning" } : undefined}
                subtitle={`${category?.name || "Uncategorized"}${subcategory ? ` › ${subcategory.name}` : ""}`}
                value={product.defaultPrice ? `€${product.defaultPrice.toFixed(2)}${product.isWeighted ? "/kg" : "/un"}` : undefined}
                onEdit={() => handleEdit(product)}
                onDelete={() => handleDelete(product)}
              />
            );
          })
        )}
      </div>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        categories={categories}
        subcategories={subcategories}
        onSave={handleSave}
        onAddSubcategory={addSubcategory}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Product"
        description={`Delete "${selectedProduct?.name}"?`}
        onConfirm={confirmDelete}
      />
    </AppLayout>
  );
}
