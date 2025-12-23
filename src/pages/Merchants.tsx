import { useState } from "react";
import { Plus, Store } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { ItemCard } from "@/components/common/ItemCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { sampleMerchants, sampleCategories, sampleReceipts } from "@/data/sampleData";

export default function Merchants() {
  const [merchants] = useState(sampleMerchants);

  const getCategory = (categoryId: string) => 
    sampleCategories.find(c => c.id === categoryId);

  const getReceiptCount = (merchantId: string) =>
    sampleReceipts.filter(r => r.merchantId === merchantId).length;

  const getTotalSpent = (merchantId: string) =>
    sampleReceipts
      .filter(r => r.merchantId === merchantId)
      .reduce((sum, r) => sum + r.total, 0);

  return (
    <AppLayout>
      <PageHeader 
        title="Merchants" 
        subtitle={`${merchants.length} saved`}
        action={
          <Button size="icon" variant="default">
            <Plus className="w-5 h-5" />
          </Button>
        }
      />

      <div className="p-4 space-y-3">
        {merchants.length === 0 ? (
          <EmptyState
            icon={<Store className="w-8 h-8 text-muted-foreground" />}
            title="No merchants yet"
            description="Add your favorite stores and restaurants to track expenses"
            actionLabel="Add Merchant"
            onAction={() => {}}
          />
        ) : (
          merchants.map(merchant => {
            const category = getCategory(merchant.categoryId);
            const receiptCount = getReceiptCount(merchant.id);
            const totalSpent = getTotalSpent(merchant.id);
            
            return (
              <ItemCard
                key={merchant.id}
                icon={category?.icon || "🏪"}
                iconBg={category?.color ? `${category.color}20` : undefined}
                title={merchant.name}
                subtitle={`${category?.name || "Uncategorized"} • ${receiptCount} receipt${receiptCount !== 1 ? "s" : ""}`}
                value={`$${totalSpent.toFixed(2)}`}
                onClick={() => {}}
              />
            );
          })
        )}
      </div>
    </AppLayout>
  );
}
