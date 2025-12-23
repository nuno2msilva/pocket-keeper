import { useState } from "react";
import { Plus, Grid3X3 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { sampleCategories, sampleReceipts, sampleMerchants } from "@/data/sampleData";

export default function Categories() {
  const [categories] = useState(sampleCategories);

  const getCategoryStats = (categoryId: string) => {
    const categoryMerchants = sampleMerchants.filter(m => m.categoryId === categoryId);
    const merchantIds = categoryMerchants.map(m => m.id);
    const categoryReceipts = sampleReceipts.filter(r => merchantIds.includes(r.merchantId));
    const totalSpent = categoryReceipts.reduce((sum, r) => sum + r.total, 0);
    return { count: categoryReceipts.length, total: totalSpent };
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Categories" 
        subtitle={`${categories.length} categories`}
        action={
          <Button size="icon" variant="default">
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
            onAction={() => {}}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {categories.map(category => {
              const stats = getCategoryStats(category.id);
              
              return (
                <button
                  key={category.id}
                  className="flex flex-col items-center p-5 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 animate-fade-in"
                  onClick={() => {}}
                >
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
                    ${stats.total.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {stats.count} receipt{stats.count !== 1 ? "s" : ""}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
