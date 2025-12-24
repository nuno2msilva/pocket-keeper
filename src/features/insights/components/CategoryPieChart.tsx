import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Category, Product, Receipt } from "@/features/shared/types";

interface CategoryPieChartProps {
  receipts: Receipt[];
  categories: Category[];
  products: Product[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
  "hsl(var(--accent))",
];

export function CategoryPieChart({ receipts, categories, products }: CategoryPieChartProps) {
  const chartData = useMemo(() => {
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

      return {
        name: category.name,
        value: Math.round(total * 100) / 100,
        color: category.color,
        icon: category.icon,
      };
    });

    return spendingByCategory.filter((s) => s.value > 0).sort((a, b) => b.value - a.value);
  }, [receipts, categories, products]);

  if (chartData.length === 0) {
    return null;
  }

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value: number) => [
              `€${value.toFixed(2)} (${((value / total) * 100).toFixed(1)}%)`,
              "Spent",
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: "hsl(var(--foreground))", fontSize: "12px" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
