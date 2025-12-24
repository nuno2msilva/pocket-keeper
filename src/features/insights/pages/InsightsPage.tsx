import { BarChart3 } from "lucide-react";
import { AppLayout, PageHeader, EmptyState, useReceipts, useCategories, useProducts } from "@/features/shared";

export default function InsightsPage() {
  const { receipts } = useReceipts();
  const { categories } = useCategories();
  const { products } = useProducts();

  const totalSpent = receipts.reduce((sum, r) => sum + r.total, 0);
  const avgReceipt = receipts.length > 0 ? totalSpent / receipts.length : 0;

  // Calculate spending by category
  const spendingByCategory = categories.map((category) => {
    const categoryProducts = products.filter((p) => p.categoryId === category.id);
    const productIds = new Set(categoryProducts.map((p) => p.id));
    
    let total = 0;
    receipts.forEach((receipt) => {
      receipt.items.forEach((item) => {
        if (productIds.has(item.productId)) {
          total += item.total;
        }
      });
    });
    
    return { category, total };
  }).filter((s) => s.total > 0).sort((a, b) => b.total - a.total);

  return (
    <AppLayout>
      <PageHeader title="Insights" subtitle="Spending overview" />

      <div className="p-4 space-y-6">
        {receipts.length === 0 ? (
          <EmptyState icon={<BarChart3 className="w-8 h-8 text-muted-foreground" />} title="No data yet" description="Add receipts to see spending insights" />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-card rounded-lg border border-border text-center">
                <p className="text-caption text-muted-foreground mb-1">Total Spent</p>
                <p className="text-xl font-bold text-primary">€{totalSpent.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border text-center">
                <p className="text-caption text-muted-foreground mb-1">Avg Receipt</p>
                <p className="text-xl font-bold">€{avgReceipt.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border text-center">
                <p className="text-caption text-muted-foreground mb-1">Receipts</p>
                <p className="text-xl font-bold">{receipts.length}</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border text-center">
                <p className="text-caption text-muted-foreground mb-1">Products</p>
                <p className="text-xl font-bold">{products.length}</p>
              </div>
            </div>

            {/* Spending by Category */}
            {spendingByCategory.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">By Category</h2>
                <div className="space-y-2">
                  {spendingByCategory.map(({ category, total }) => (
                    <div key={category.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: `${category.color}20` }}>{category.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium">{category.name}</p>
                        <div className="w-full h-2 bg-secondary rounded-full mt-1 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(total / totalSpent) * 100}%`, backgroundColor: category.color }} />
                        </div>
                      </div>
                      <p className="font-semibold">€{total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
