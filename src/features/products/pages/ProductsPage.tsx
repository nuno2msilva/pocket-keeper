import { useState } from "react";
import { Plus, Package, Pencil, Trash2, AlertCircle } from "lucide-react";
import { AppLayout, PageHeader, EmptyState, DeleteConfirmDialog, useProducts, useCategories, useSubcategories, Product } from "@/features/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductDialog } from "../components/ProductDialog";
import { toast } from "sonner";

export default function ProductsPage() {
  const { products, updateProduct, deleteProduct, addProduct } = useProducts();
  const { categories } = useCategories();
  const { subcategories } = useSubcategories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const getCategory = (categoryId?: string) => (categoryId ? categories.find((c) => c.id === categoryId) : undefined);
  const getSubcategory = (subcategoryId?: string) => (subcategoryId ? subcategories.find((s) => s.id === subcategoryId) : undefined);

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

  const sortedProducts = [...products].sort((a, b) => {
    if (!a.categoryId && b.categoryId) return -1;
    if (a.categoryId && !b.categoryId) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <AppLayout>
      <PageHeader title="Products" subtitle={`${products.length} tracked`} action={<Button size="icon" variant="default" onClick={handleAdd} aria-label="Add product"><Plus className="w-5 h-5" /></Button>} />

      <div className="p-4 space-y-3">
        {products.length === 0 ? (
          <EmptyState icon={<Package className="w-8 h-8 text-muted-foreground" />} title="No products yet" description="Products are created automatically when you add them to receipts" actionLabel="Add Product" onAction={handleAdd} />
        ) : (
          sortedProducts.map((product) => {
            const category = getCategory(product.categoryId);
            const subcategory = getSubcategory(product.subcategoryId);
            const needsReview = !product.categoryId || !product.isSolidified;

            return (
              <div key={product.id} className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 animate-fade-in min-h-[72px]">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: category?.color ? `${category.color}20` : "hsl(var(--secondary))" }}>{category?.icon || "📦"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-body font-semibold text-foreground truncate">{product.name}</h3>
                    {needsReview && <Badge variant="outline" className="text-warning border-warning/50 shrink-0"><AlertCircle className="w-3 h-3 mr-1" />Review</Badge>}
                  </div>
                  <p className="text-caption text-muted-foreground">{category?.name || "Uncategorized"}{subcategory && ` › ${subcategory.name}`}</p>
                </div>
                {product.defaultPrice && <div className="text-right shrink-0"><p className="text-body font-semibold text-foreground">€{product.defaultPrice.toFixed(2)}</p></div>}
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(product)} aria-label="Edit product"><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(product)} aria-label="Delete product"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} product={selectedProduct} categories={categories} subcategories={subcategories} onSave={handleSave} />
      <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Delete Product" description={`Delete "${selectedProduct?.name}"?`} onConfirm={confirmDelete} />
    </AppLayout>
  );
}
