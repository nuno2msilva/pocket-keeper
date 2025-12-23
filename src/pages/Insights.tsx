import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { sampleCategories, sampleReceipts, sampleMerchants } from "@/data/sampleData";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag } from "lucide-react";

export default function Insights() {
  // Calculate category spending
  const getCategorySpending = () => {
    return sampleCategories.map(category => {
      const categoryMerchants = sampleMerchants.filter(m => m.categoryId === category.id);
      const merchantIds = categoryMerchants.map(m => m.id);
      const total = sampleReceipts
        .filter(r => merchantIds.includes(r.merchantId))
        .reduce((sum, r) => sum + r.total, 0);
      return { ...category, total };
    }).sort((a, b) => b.total - a.total);
  };

  const categorySpending = getCategorySpending();
  const totalSpent = categorySpending.reduce((sum, c) => sum + c.total, 0);
  const topCategory = categorySpending[0];

  // Calculate this month stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthReceipts = sampleReceipts.filter(r => {
    const date = new Date(r.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  const thisMonthTotal = thisMonthReceipts.reduce((sum, r) => sum + r.total, 0);
  const averagePerReceipt = thisMonthReceipts.length > 0 
    ? thisMonthTotal / thisMonthReceipts.length 
    : 0;

  return (
    <AppLayout>
      <PageHeader 
        title="Insights" 
        subtitle="Your spending overview"
      />

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-lg border border-border p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-caption text-muted-foreground">This Month</p>
            <p className="text-heading text-foreground">${thisMonthTotal.toFixed(2)}</p>
          </div>

          <div className="bg-card rounded-lg border border-border p-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-accent" />
              </div>
            </div>
            <p className="text-caption text-muted-foreground">Avg. Receipt</p>
            <p className="text-heading text-foreground">${averagePerReceipt.toFixed(2)}</p>
          </div>
        </div>

        {/* Top Category */}
        {topCategory && topCategory.total > 0 && (
          <div className="bg-card rounded-lg border border-border p-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-caption font-medium text-muted-foreground mb-3">Top Category</h3>
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ backgroundColor: `${topCategory.color}20` }}
              >
                {topCategory.icon}
              </div>
              <div className="flex-1">
                <p className="text-body font-semibold text-foreground">{topCategory.name}</p>
                <p className="text-caption text-muted-foreground">
                  {((topCategory.total / totalSpent) * 100).toFixed(0)}% of total spending
                </p>
              </div>
              <p className="text-body-lg font-semibold text-foreground">
                ${topCategory.total.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Spending by Category */}
        <div className="bg-card rounded-lg border border-border p-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-caption font-medium text-muted-foreground mb-4">Spending by Category</h3>
          <div className="space-y-4">
            {categorySpending.map((category, index) => {
              const percentage = totalSpent > 0 ? (category.total / totalSpent) * 100 : 0;
              
              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-body text-foreground">{category.name}</span>
                    </div>
                    <span className="text-body font-medium text-foreground">
                      ${category.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: category.color,
                        animationDelay: `${0.4 + index * 0.1}s`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Trend */}
        <div className="bg-card rounded-lg border border-border p-4 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <h3 className="text-caption font-medium text-muted-foreground mb-3">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-body text-muted-foreground">Total Receipts</span>
              <span className="text-body font-semibold text-foreground">{sampleReceipts.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border">
              <span className="text-body text-muted-foreground">Total Merchants</span>
              <span className="text-body font-semibold text-foreground">{sampleMerchants.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border">
              <span className="text-body text-muted-foreground">All-time Spending</span>
              <span className="text-body font-semibold text-foreground">${totalSpent.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
