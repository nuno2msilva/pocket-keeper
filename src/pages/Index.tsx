import { useState } from "react";
import { Plus, Receipt } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReceiptCard } from "@/components/receipts/ReceiptCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { sampleReceipts, sampleMerchants, sampleCategories } from "@/data/sampleData";

const Index = () => {
  const [receipts] = useState(sampleReceipts);

  const getMerchant = (merchantId: string) => 
    sampleMerchants.find(m => m.id === merchantId);
  
  const getCategory = (merchantId: string) => {
    const merchant = getMerchant(merchantId);
    return sampleCategories.find(c => c.id === merchant?.categoryId);
  };

  // Calculate this month's total
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthTotal = receipts
    .filter(r => {
      const date = new Date(r.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, r) => sum + r.total, 0);

  return (
    <AppLayout>
      <PageHeader 
        title="Receipts" 
        subtitle={`$${thisMonthTotal.toFixed(2)} this month`}
        action={
          <Button size="icon" variant="default">
            <Plus className="w-5 h-5" />
          </Button>
        }
      />

      <div className="p-4 space-y-3">
        {receipts.length === 0 ? (
          <EmptyState
            icon={<Receipt className="w-8 h-8 text-muted-foreground" />}
            title="No receipts yet"
            description="Start tracking your expenses by adding your first receipt"
            actionLabel="Add Receipt"
            onAction={() => {}}
          />
        ) : (
          receipts
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(receipt => (
              <ReceiptCard
                key={receipt.id}
                receipt={receipt}
                merchant={getMerchant(receipt.merchantId)}
                category={getCategory(receipt.merchantId)}
                onClick={() => {}}
              />
            ))
        )}
      </div>
    </AppLayout>
  );
};

export default Index;
