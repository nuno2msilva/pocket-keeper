import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Receipt as ReceiptIcon, Check, ChevronRight } from "lucide-react";
import { AppLayout, PageHeader, EmptyState, useReceipts, useMerchants, useProducts } from "@/features/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReceiptDialog } from "../components/ReceiptDialog";
import { Receipt } from "@/features/shared";
import { toast } from "sonner";

export default function ReceiptsPage() {
  const navigate = useNavigate();
  const { receipts, addReceipt, updateReceipt } = useReceipts();
  const { merchants, getOrCreateMerchant, searchMerchants } = useMerchants();
  const { products, getOrCreateProduct } = useProducts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const getMerchant = (merchantId: string) => merchants.find((m) => m.id === merchantId);

  // Calculate this month's total
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthTotal = receipts
    .filter((r) => {
      const date = new Date(r.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, r) => sum + r.total, 0);

  const handleAdd = () => {
    setSelectedReceipt(null);
    setDialogOpen(true);
  };

  const handleSave = (data: Omit<Receipt, "id">) => {
    if (selectedReceipt) {
      updateReceipt(selectedReceipt.id, data);
      toast.success("Receipt updated");
    } else {
      addReceipt(data);
      toast.success("Receipt created");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Receipts"
        subtitle={`€${thisMonthTotal.toFixed(2)} this month`}
        action={
          <Button size="icon" variant="default" onClick={handleAdd} aria-label="Add receipt">
            <Plus className="w-5 h-5" />
          </Button>
        }
      />

      <div className="p-4 space-y-3">
        {receipts.length === 0 ? (
          <EmptyState
            icon={<ReceiptIcon className="w-8 h-8 text-muted-foreground" />}
            title="No receipts yet"
            description="Start tracking your expenses by adding your first receipt"
            actionLabel="Add Receipt"
            onAction={handleAdd}
          />
        ) : (
          receipts
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((receipt) => {
              const merchant = getMerchant(receipt.merchantId);
              const isNewMerchant = merchant && !merchant.isSolidified;

              return (
                <button
                  key={receipt.id}
                  onClick={() => navigate(`/receipts/${receipt.id}`)}
                  className="w-full flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 animate-fade-in text-left min-h-[72px]"
                  aria-label={`View receipt from ${merchant?.name || "Unknown"} for €${receipt.total.toFixed(2)}`}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 bg-secondary">
                    🧾
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-body font-semibold text-foreground truncate">
                        {merchant?.name || "Unknown Store"}
                      </h3>
                      {isNewMerchant && (
                        <Badge variant="outline" className="text-warning border-warning/50 shrink-0 text-[10px]">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-caption text-muted-foreground">
                      {formatDate(receipt.date)} • {receipt.items.length} item
                      {receipt.items.length !== 1 ? "s" : ""}
                    </p>
                    {receipt.hasCustomerNif && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-success">
                        <Check className="w-3 h-3" aria-hidden="true" /> NIF
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-body font-semibold text-foreground">
                      €{receipt.total.toFixed(2)}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden="true" />
                </button>
              );
            })
        )}
      </div>

      <ReceiptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        receipt={selectedReceipt}
        merchants={merchants}
        products={products}
        onSave={handleSave}
        onGetOrCreateProduct={getOrCreateProduct}
        onGetOrCreateMerchant={getOrCreateMerchant}
        onSearchMerchants={searchMerchants}
      />
    </AppLayout>
  );
}
