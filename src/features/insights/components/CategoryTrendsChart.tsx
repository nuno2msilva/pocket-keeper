import { useMemo } from "react";
import { format, startOfMonth, subMonths, endOfMonth, isWithinInterval } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Category, Product, Receipt } from "@/features/shared/types";

interface CategoryTrendsChartProps {
  receipts: Receipt[];
  categories: Category[];
  products: Product[];
}

export function CategoryTrendsChart({ receipts, categories, products }: CategoryTrendsChartProps) {
  const chartData = useMemo(() => {
    const months: Record<string, Record<string, number>> = {};
    const now = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const label = format(monthStart, "MMM");
      months[label] = {};
      categories.forEach((cat) => {
        months[label][cat.id] = 0;
      });
    }

    // Calculate spending per category per month
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(monthStart);
      const label = format(monthStart, "MMM");

      const monthReceipts = receipts.filter((r) => {
        const date = new Date(r.date);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      });

      monthReceipts.forEach((receipt) => {
        receipt.items.forEach((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (product?.categoryId && months[label][product.categoryId] !== undefined) {
            months[label][product.categoryId] += item.total;
          }
        });
      });
    }

    // Convert to chart format
    return Object.entries(months).map(([month, categoryTotals]) => ({
      month,
      ...categoryTotals,
    }));
  }, [receipts, categories, products]);

  // Get top 5 categories by total spending
  const topCategories = useMemo(() => {
    const totals: Record<string, number> = {};
    categories.forEach((cat) => {
      totals[cat.id] = chartData.reduce((sum, month) => sum + (month[cat.id] || 0), 0);
    });
    return categories
      .filter((cat) => totals[cat.id] > 0)
      .sort((a, b) => totals[b.id] - totals[a.id])
      .slice(0, 5);
  }, [categories, chartData]);

  if (topCategories.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
        No category data available
      </div>
    );
  }

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickFormatter={(value) => `€${value}`}
            width={45}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number, name: string) => {
              const cat = categories.find((c) => c.id === name);
              return [`€${value.toFixed(2)}`, cat?.name || name];
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => {
              const cat = categories.find((c) => c.id === value);
              return <span className="text-xs">{cat?.icon} {cat?.name}</span>;
            }}
          />
          {topCategories.map((category) => (
            <Line
              key={category.id}
              type="monotone"
              dataKey={category.id}
              stroke={category.color}
              strokeWidth={2}
              dot={{ fill: category.color, r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
