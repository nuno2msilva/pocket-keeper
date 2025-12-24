import { BarChart3, TrendingUp, PieChart } from "lucide-react";
import { AppLayout, PageHeader, EmptyState, useReceipts, useCategories, useProducts } from "@/features/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpendingTrendsChart } from "../components/SpendingTrendsChart";
import { CategoryPieChart } from "../components/CategoryPieChart";

export default function InsightsPage() {
  const { receipts } = useReceipts();
  const { categories } = useCategories();
  const { products } = useProducts();

  const totalSpent = receipts.reduce((sum, r) => sum + r.total, 0);
  const avgReceipt = receipts.length > 0 ? totalSpent / receipts.length : 0;

  return (
    <AppLayout>
      <PageHeader title="Insights" subtitle="Spending overview" />

      <div className="p-4 space-y-6 pb-24">
        {receipts.length === 0 ? (
          <EmptyState icon={<BarChart3 className="w-8 h-8 text-muted-foreground" />} title="No data yet" description="Add receipts to see spending insights" />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="text-center">
                <CardContent className="pt-4 pb-4">
                  <p className="text-caption text-muted-foreground mb-1">Total Spent</p>
                  <p className="text-xl font-bold text-primary">€{totalSpent.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4 pb-4">
                  <p className="text-caption text-muted-foreground mb-1">Avg Receipt</p>
                  <p className="text-xl font-bold">€{avgReceipt.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4 pb-4">
                  <p className="text-caption text-muted-foreground mb-1">Receipts</p>
                  <p className="text-xl font-bold">{receipts.length}</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4 pb-4">
                  <p className="text-caption text-muted-foreground mb-1">Products</p>
                  <p className="text-xl font-bold">{products.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* Spending Trends Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Monthly Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SpendingTrendsChart receipts={receipts} />
              </CardContent>
            </Card>

            {/* Category Breakdown Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  By Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryPieChart receipts={receipts} categories={categories} products={products} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
