import { useState } from "react";
import { Plus, Package, Pencil, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { ProductDialog } from "@/components/products/ProductDialog";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";
import { useProducts, useCategories } from "@/hooks/useLocalStorage";
import { Product } from "@/types/expense";
import { toast } from "sonner";

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { categories } = useCategories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const getCategory = (categoryId: string) => 
    categories.find(c => c.id === categoryId);

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
      updateProduct(selectedProduct.id, data);
      toast.success("Product updated");
    } else {
      addProduct(data);
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

  return (
    <AppLayout>
      <PageHeader 
        title="Products" 
        subtitle={`${products.length} tracked`}
        action={
          <Button size="icon" variant="default" onClick={handleAdd}>
            <Plus className="w-5 h-5" />
          </Button>
        }
      />

      <div className="p-4 space-y-3">
        {products.length === 0 ? (
          <EmptyState
            icon={<Package className="w-8 h-8 text-muted-foreground" />}
            title="No products yet"
            description="Track individual products to monitor price changes over time"
            actionLabel="Add Product"
            onAction={handleAdd}
          />
        ) : (
          products.map(product => {
            const category = getCategory(product.categoryId);
            
            return (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 animate-fade-in"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: category?.color ? `${category.color}20` : 'hsl(var(--secondary))' }}
                >
                  {category?.icon || "📦"}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-body font-semibold text-foreground truncate">
                    {product.name}
                  </h3>
                  <p className="text-caption text-muted-foreground">
                    {category?.name || "Uncategorized"}
                    {product.excludeFromPriceHistory && " • No price tracking"}
                  </p>
                </div>

                {product.defaultPrice && (
                  <div className="text-right shrink-0">
                    <p className="text-body font-semibold text-foreground">
                      €{product.defaultPrice.toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleEdit(product)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(product)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        categories={categories}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Product"
        description={`Are you sure you want to delete "${selectedProduct?.name}"?`}
        onConfirm={confirmDelete}
      />
    </AppLayout>
  );
}
