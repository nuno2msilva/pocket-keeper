import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, startOfMonth, subMonths, isWithinInterval, endOfMonth } from "date-fns";
import { Receipt } from "@/features/shared/types";

interface SpendingTrendsChartProps {
  receipts: Receipt[];
}

export function SpendingTrendsChart({ receipts }: SpendingTrendsChartProps) {
  const chartData = useMemo(() => {
    const months: { month: Date; label: string; total: number }[] = [];
    const now = new Date();

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(monthStart);
      
      const total = receipts
        .filter((r) => {
          const receiptDate = new Date(r.date);
          return isWithinInterval(receiptDate, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, r) => sum + r.total, 0);

      months.push({
        month: monthStart,
        label: format(monthStart, "MMM"),
        total: Math.round(total * 100) / 100,
      });
    }

    return months;
  }, [receipts]);

  const maxValue = Math.max(...chartData.map((d) => d.total), 1);

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickFormatter={(value) => `€${value}`}
            domain={[0, maxValue * 1.1]}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value: number) => [`€${value.toFixed(2)}`, "Total"]}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
