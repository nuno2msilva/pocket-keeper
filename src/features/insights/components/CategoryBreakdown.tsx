import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Category, Subcategory, Product } from "@/features/shared/types";

interface CategoryBreakdownProps {
  categorySpending: Record<string, { total: number; items: number; subcategories: Record<string, number> }>;
  categories: Category[];
  subcategories: Subcategory[];
  products: Product[];
  monthTotal: number;
  onCategoryClick: (categoryId: string) => void;
}

export function CategoryBreakdown({
  categorySpending,
  categories,
  subcategories,
  monthTotal,
  onCategoryClick,
}: CategoryBreakdownProps) {
  // Sort categories by spending
  const sortedCategories = categories
    .filter((cat) => categorySpending[cat.id]?.total > 0)
    .sort((a, b) => (categorySpending[b.id]?.total || 0) - (categorySpending[a.id]?.total || 0));

  if (sortedCategories.length === 0 && !categorySpending["uncategorized"]) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No spending data for this month
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {sortedCategories.map((category) => {
        const spending = categorySpending[category.id];
        const percentage = monthTotal > 0 ? (spending.total / monthTotal) * 100 : 0;

        return (
          <button
            key={category.id}
            onClick={() => onCategoryClick(category.id)}
            className="w-full bg-card rounded-lg border border-border p-3 hover:border-primary/30 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: `${category.color}20` }}
              >
                {category.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">{category.name}</span>
                  <span className="font-bold text-sm">€{spending.total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex-1 mr-3">
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          </button>
        );
      })}

      {/* Uncategorized */}
      {categorySpending["uncategorized"]?.total > 0 && (
        <div className="bg-card rounded-lg border border-border p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 bg-secondary">
              📦
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Uncategorized</span>
                <span className="font-bold text-sm">
                  €{categorySpending["uncategorized"].total.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {categorySpending["uncategorized"].items} items need categorization
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
