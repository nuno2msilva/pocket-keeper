import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Receipt, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { AppLayout, PageHeader, useReceipts, useMerchants, useCategories, useProducts } from "@/features/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { receipts } = useReceipts();
  const { merchants } = useMerchants();
  const { categories } = useCategories();
  const { products } = useProducts();

  // Date calculations
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Calculate spending by category
  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {};

    receipts
      .filter((r) => {
        const date = new Date(r.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .forEach((receipt) => {
        receipt.items.forEach((item) => {
          const product = products.find((p) => p.id === item.productId);
          const categoryId = product?.categoryId || "uncategorized";
          spending[categoryId] = (spending[categoryId] || 0) + item.total;
        });
      });

    return spending;
  }, [receipts, products, currentMonth, currentYear]);

  // Prepare pie chart data
  const pieData = useMemo(() => {
    return Object.entries(categorySpending)
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId);
        return {
          name: category?.name || "Uncategorized",
          value: amount,
          color: category?.color || "hsl(0, 0%, 50%)",
          icon: category?.icon || "📦",
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [categorySpending, categories]);

  // Calculate totals
  const thisMonthTotal = receipts
    .filter((r) => {
      const date = new Date(r.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, r) => sum + r.total, 0);

  const lastMonthTotal = receipts
    .filter((r) => {
      const date = new Date(r.date);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    })
    .reduce((sum, r) => sum + r.total, 0);

  const monthChange = lastMonthTotal > 0 
    ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
    : 0;

  const thisMonthReceipts = receipts.filter((r) => {
    const date = new Date(r.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  // Top categories this month
  const topCategories = pieData.slice(0, 3);

  return (
    <AppLayout>
      <PageHeader 
        title="Dashboard" 
        subtitle={now.toLocaleDateString("pt-PT", { month: "long", year: "numeric" })} 
      />

      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">This Month</p>
              <p className="text-2xl font-bold">€{thisMonthTotal.toFixed(2)}</p>
              {lastMonthTotal > 0 && (
                <div className={`flex items-center gap-1 text-xs mt-1 ${monthChange > 0 ? "text-destructive" : "text-success"}`}>
                  {monthChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{Math.abs(monthChange).toFixed(1)}% vs last month</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Receipts</p>
              <p className="text-2xl font-bold">{thisMonthReceipts}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {merchants.length} stores tracked
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pie Chart Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Spending by Category</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/insights")}
                className="text-xs"
              >
                Details <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`€${value.toFixed(2)}`, ""]}
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No spending data this month
              </div>
            )}

            {/* Legend */}
            {pieData.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {pieData.slice(0, 6).map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs truncate">{item.icon} {item.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      €{item.value.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topCategories.map((cat, index) => {
                const percentage = thisMonthTotal > 0 
                  ? (cat.value / thisMonthTotal) * 100 
                  : 0;
                
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {cat.icon} {cat.name}
                      </span>
                      <span className="text-sm">€{cat.value.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => navigate("/")}
        >
          <Receipt className="w-5 h-5 mr-2" />
          Add New Receipt
        </Button>
      </div>
    </AppLayout>
  );
}
