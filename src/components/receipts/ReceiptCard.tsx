import { Receipt, Merchant, Category } from "@/types/expense";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface ReceiptCardProps {
  receipt: Receipt;
  merchant: Merchant | undefined;
  category: Category | undefined;
  onClick?: () => void;
}

export function ReceiptCard({ receipt, merchant, category, onClick }: ReceiptCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 text-left animate-fade-in"
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: category?.color ? `${category.color}20` : 'hsl(var(--muted))' }}
      >
        {category?.icon || "📝"}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-body font-semibold text-foreground truncate">
          {merchant?.name || "Unknown Merchant"}
        </h3>
        <p className="text-caption text-muted-foreground">
          {format(new Date(receipt.date), "MMM d, yyyy")} • {receipt.items.length} item{receipt.items.length !== 1 ? "s" : ""}
        </p>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-body-lg font-semibold text-foreground">
          ${receipt.total.toFixed(2)}
        </span>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </button>
  );
}
