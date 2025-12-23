import { useState } from "react";
import { Plus, Package } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { ItemCard } from "@/components/common/ItemCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { sampleProducts, sampleCategories } from "@/data/sampleData";

export default function Products() {
  const [products] = useState(sampleProducts);

  const getCategory = (categoryId: string) => 
    sampleCategories.find(c => c.id === categoryId);

  return (
    <AppLayout>
      <PageHeader 
        title="Products" 
        subtitle={`${products.length} tracked`}
        action={
          <Button size="icon" variant="default">
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
            onAction={() => {}}
          />
        ) : (
          products.map(product => {
            const category = getCategory(product.categoryId);
            
            return (
              <ItemCard
                key={product.id}
                icon={category?.icon || "📦"}
                iconBg={category?.color ? `${category.color}20` : undefined}
                title={product.name}
                subtitle={category?.name || "Uncategorized"}
                value={product.defaultPrice ? `$${product.defaultPrice.toFixed(2)}` : undefined}
                onClick={() => {}}
              />
            );
          })
        )}
      </div>
    </AppLayout>
  );
}
