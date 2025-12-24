import { useState } from "react";
import { Plus, Receipt as ReceiptIcon, Eye, Pencil, Trash2, Check, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { ReceiptDialog } from "@/components/receipts/ReceiptDialog";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";
import { useReceipts, useMerchants, useProducts } from "@/hooks/useLocalStorage";
import { Receipt } from "@/types/expense";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Index = () => {
  const { receipts, addReceipt, updateReceipt, deleteReceipt } = useReceipts();
  const { merchants, findMerchantByNif } = useMerchants();
  const { products, getOrCreateProduct } = useProducts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const getMerchant = (merchantId: string) => 
    merchants.find(m => m.id === merchantId);

  // Calculate this month's total
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthTotal = receipts
    .filter(r => {
      const date = new Date(r.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, r) => sum + r.total, 0);

  const handleAdd = () => {
    setSelectedReceipt(null);
    setDialogOpen(true);
  };

  const handleEdit = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setDialogOpen(true);
  };

  const handleView = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setViewDialogOpen(true);
  };

  const handleDelete = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setDeleteDialogOpen(true);
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

  const confirmDelete = () => {
    if (selectedReceipt) {
      deleteReceipt(selectedReceipt.id);
      toast.success("Receipt deleted");
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Receipts" 
        subtitle={`€${thisMonthTotal.toFixed(2)} this month`}
        action={
          <Button size="icon" variant="default" onClick={handleAdd}>
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
            .map(receipt => {
              const merchant = getMerchant(receipt.merchantId);
              
              return (
                <div
                  key={receipt.id}
                  className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 animate-fade-in"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 bg-secondary">
                    🧾
                  </div>
                  
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleView(receipt)}>
                    <h3 className="text-body font-semibold text-foreground truncate">
                      {merchant?.name || "Unknown Merchant"}
                    </h3>
                    <p className="text-caption text-muted-foreground">
                      {formatDate(receipt.date)} • {receipt.items.length} item{receipt.items.length !== 1 ? "s" : ""}
                    </p>
                    {receipt.hasCustomerNif && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-success">
                        <Check className="w-3 h-3" /> NIF
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-body font-semibold text-foreground">
                      €{receipt.total.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleView(receipt)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEdit(receipt)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(receipt)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
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
        onFindMerchantByNif={findMerchantByNif}
        onGetOrCreateProduct={getOrCreateProduct}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Receipt"
        description="Are you sure you want to delete this receipt? This action cannot be undone."
        onConfirm={confirmDelete}
      />

      {/* View Receipt Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-subheading font-semibold">
                    {getMerchant(selectedReceipt.merchantId)?.name}
                  </h3>
                  <p className="text-caption text-muted-foreground">
                    {formatDate(selectedReceipt.date)}
                    {selectedReceipt.time && ` at ${selectedReceipt.time}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">
                    €{selectedReceipt.total.toFixed(2)}
                  </p>
                </div>
              </div>

              {selectedReceipt.receiptNumber && (
                <div className="text-caption text-muted-foreground">
                  Receipt #: {selectedReceipt.receiptNumber}
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                <span className="text-body font-medium">NIF requested:</span>
                {selectedReceipt.hasCustomerNif ? (
                  <span className="flex items-center gap-1 text-success">
                    <Check className="w-4 h-4" />
                    Yes
                    {selectedReceipt.customerNif && (
                      <span className="text-muted-foreground ml-1">
                        ({selectedReceipt.customerNif})
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <X className="w-4 h-4" />
                    No
                  </span>
                )}
              </div>

              {selectedReceipt.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-body font-semibold">Items</h4>
                  <div className="space-y-2">
                    {selectedReceipt.items.map(item => (
                      <div key={item.id} className="flex justify-between p-2 bg-secondary/50 rounded">
                        <div>
                          <span className="text-body">{item.productName}</span>
                          <span className="text-caption text-muted-foreground ml-2">
                            x{item.quantity} @ €{item.unitPrice.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-body font-medium">€{item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReceipt.notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-caption text-muted-foreground">{selectedReceipt.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Index;
