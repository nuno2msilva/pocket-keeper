import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Receipt, ChevronRight, ChevronLeft, PieChart, BarChart3 } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, addMonths, isWithinInterval } from "date-fns";
import { AppLayout, PageHeader, EmptyState, useReceipts, useMerchants, useCategories, useSubcategories, useProducts } from "@/features/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpendingTrendsChart } from "@/features/insights/components/SpendingTrendsChart";
import { CategoryPieChart } from "@/features/insights/components/CategoryPieChart";
import { CategoryTrendsChart } from "@/features/insights/components/CategoryTrendsChart";
import { CategoryBreakdown } from "@/features/insights/components/CategoryBreakdown";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { receipts } = useReceipts();
  const { merchants } = useMerchants();
  const { categories } = useCategories();
  const { subcategories, getSubcategoriesByCategory } = useSubcategories();
  const { products } = useProducts();

  // Month navigation state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  // Filter receipts for selected month
  const monthReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const date = new Date(r.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });
  }, [receipts, monthStart, monthEnd]);

  // Calculate totals
  const totalSpent = receipts.reduce((sum, r) => sum + r.total, 0);
  const monthTotal = monthReceipts.reduce((sum, r) => sum + r.total, 0);
  const avgReceipt = monthReceipts.length > 0 ? monthTotal / monthReceipts.length : 0;

  // Previous month comparison
  const prevMonthStart = startOfMonth(subMonths(selectedDate, 1));
  const prevMonthEnd = endOfMonth(subMonths(selectedDate, 1));
  const prevMonthTotal = receipts
    .filter((r) => {
      const date = new Date(r.date);
      return isWithinInterval(date, { start: prevMonthStart, end: prevMonthEnd });
    })
    .reduce((sum, r) => sum + r.total, 0);
  
  const monthChange = prevMonthTotal > 0 
    ? ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100 
    : 0;

  // Calculate spending by category for selected month
  const categorySpending = useMemo(() => {
    const spending: Record<string, { total: number; items: number; subcategories: Record<string, number> }> = {};

    monthReceipts.forEach((receipt) => {
      receipt.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        const categoryId = product?.categoryId || "uncategorized";
        const subcategoryId = product?.subcategoryId || "none";

        if (!spending[categoryId]) {
          spending[categoryId] = { total: 0, items: 0, subcategories: {} };
        }
        spending[categoryId].total += item.total;
        spending[categoryId].items += 1;

        if (subcategoryId !== "none") {
          spending[categoryId].subcategories[subcategoryId] =
            (spending[categoryId].subcategories[subcategoryId] || 0) + item.total;
        }
      });
    });

    return spending;
  }, [monthReceipts, products]);

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedDate((prev) =>
      direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const isCurrentMonth =
    selectedDate.getMonth() === new Date().getMonth() &&
    selectedDate.getFullYear() === new Date().getFullYear();

  return (
    <AppLayout>
      <PageHeader title="Home" subtitle="Your spending overview" />

      <div className="p-4 space-y-4 pb-24">
        {receipts.length === 0 ? (
          <EmptyState
            icon={<Receipt className="w-8 h-8 text-muted-foreground" />}
            title="No receipts yet"
            description="Add your first receipt to see spending insights"
          />
        ) : (
          <>
            {/* Month Navigator */}
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => navigateMonth("prev")}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div className="text-center">
                    <p className="font-semibold">
                      {format(selectedDate, "MMMM yyyy")}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      €{monthTotal.toFixed(2)}
                    </p>
                    {prevMonthTotal > 0 && (
                      <div className={`flex items-center justify-center gap-1 text-xs mt-1 ${monthChange > 0 ? "text-destructive" : "text-success"}`}>
                        {monthChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{Math.abs(monthChange).toFixed(1)}% vs last month</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => navigateMonth("next")}
                    disabled={isCurrentMonth}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2">
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Receipts</p>
                  <p className="text-lg font-bold">{monthReceipts.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Avg Receipt</p>
                  <p className="text-lg font-bold">€{avgReceipt.toFixed(0)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">All Time</p>
                  <p className="text-lg font-bold">€{totalSpent.toFixed(0)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="breakdown" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>

              {/* Monthly Breakdown Tab */}
              <TabsContent value="breakdown" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <PieChart className="w-4 h-4" />
                      Category Split
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryPieChart
                      receipts={monthReceipts}
                      categories={categories}
                      products={products}
                    />
                  </CardContent>
                </Card>

                <CategoryBreakdown
                  categorySpending={categorySpending}
                  categories={categories}
                  subcategories={subcategories}
                  products={products}
                  monthTotal={monthTotal}
                  onCategoryClick={(categoryId) => navigate(`/categories/${categoryId}`)}
                />
              </TabsContent>

              {/* Trends Tab */}
              <TabsContent value="trends" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Monthly Spending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SpendingTrendsChart receipts={receipts} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Category Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryTrendsChart
                      receipts={receipts}
                      categories={categories}
                      products={products}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Categories Tab */}
              <TabsContent value="categories" className="space-y-3 mt-4">
                {categories.map((category) => {
                  const spending = categorySpending[category.id];
                  if (!spending || spending.total === 0) return null;

                  const percentage = monthTotal > 0 ? (spending.total / monthTotal) * 100 : 0;
                  const subcats = getSubcategoriesByCategory(category.id);

                  return (
                    <Card key={category.id}>
                      <CardContent className="p-4">
                        <button
                          onClick={() => navigate(`/categories/${category.id}`)}
                          className="w-full text-left"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{category.icon}</span>
                              <span className="font-semibold">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">€{spending.total.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">
                                {percentage.toFixed(1)}%
                              </p>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: category.color,
                              }}
                            />
                          </div>

                          {/* Subcategory breakdown */}
                          {Object.keys(spending.subcategories).length > 0 && (
                            <div className="space-y-1 pl-6 border-l-2" style={{ borderColor: category.color }}>
                              {Object.entries(spending.subcategories)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 3)
                                .map(([subcatId, amount]) => {
                                  const subcat = subcats.find((s) => s.id === subcatId);
                                  return (
                                    <div key={subcatId} className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        {subcat?.name || "Other"}
                                      </span>
                                      <span>€{amount.toFixed(2)}</span>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </button>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Uncategorized */}
                {categorySpending["uncategorized"]?.total > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📦</span>
                          <span className="font-semibold">Uncategorized</span>
                        </div>
                        <p className="font-bold">
                          €{categorySpending["uncategorized"].total.toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Quick Action */}
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate("/receipts?add=true")}
            >
              <Receipt className="w-5 h-5 mr-2" />
              Add New Receipt
            </Button>
          </>
        )}
      </div>
    </AppLayout>
  );
}
