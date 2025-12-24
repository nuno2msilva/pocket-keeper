import { useState } from "react";
import { Plus, Store, Pencil, Trash2, AlertCircle } from "lucide-react";
import { AppLayout, PageHeader, EmptyState, DeleteConfirmDialog, useMerchants, useReceipts, Merchant } from "@/features/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MerchantDialog } from "../components/MerchantDialog";
import { toast } from "sonner";

export default function MerchantsPage() {
  const { merchants, addMerchant, updateMerchant, deleteMerchant } = useMerchants();
  const { receipts } = useReceipts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  const getReceiptCount = (merchantId: string) =>
    receipts.filter((r) => r.merchantId === merchantId).length;

  const getTotalSpent = (merchantId: string) =>
    receipts.filter((r) => r.merchantId === merchantId).reduce((sum, r) => sum + r.total, 0);

  const handleAdd = () => {
    setSelectedMerchant(null);
    setDialogOpen(true);
  };

  const handleEdit = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setDialogOpen(true);
  };

  const handleDelete = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setDeleteDialogOpen(true);
  };

  const handleSave = (data: Omit<Merchant, "id">) => {
    if (selectedMerchant) {
      updateMerchant(selectedMerchant.id, { ...data, isSolidified: true });
      toast.success("Store updated");
    } else {
      addMerchant({ ...data, isSolidified: true });
      toast.success("Store created");
    }
  };

  const confirmDelete = () => {
    if (selectedMerchant) {
      deleteMerchant(selectedMerchant.id);
      toast.success("Store deleted");
      setDeleteDialogOpen(false);
    }
  };

  // Sort: unsolidified first, then by name
  const sortedMerchants = [...merchants].sort((a, b) => {
    if (!a.isSolidified && b.isSolidified) return -1;
    if (a.isSolidified && !b.isSolidified) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <AppLayout>
      <PageHeader
        title="Stores"
        subtitle={`${merchants.length} saved`}
        action={
          <Button size="icon" variant="default" onClick={handleAdd} aria-label="Add store">
            <Plus className="w-5 h-5" />
          </Button>
        }
      />

      <div className="p-4 space-y-3">
        {merchants.length === 0 ? (
          <EmptyState
            icon={<Store className="w-8 h-8 text-muted-foreground" />}
            title="No stores yet"
            description="Stores are created automatically when you add receipts"
            actionLabel="Add Store"
            onAction={handleAdd}
          />
        ) : (
          sortedMerchants.map((merchant) => {
            const receiptCount = getReceiptCount(merchant.id);
            const totalSpent = getTotalSpent(merchant.id);
            const needsReview = !merchant.isSolidified;

            return (
              <div
                key={merchant.id}
                className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 animate-fade-in min-h-[72px]"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 bg-secondary">
                  🏪
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-body font-semibold text-foreground truncate">
                      {merchant.name}
                    </h3>
                    {needsReview && (
                      <Badge variant="outline" className="text-warning border-warning/50 shrink-0">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Review
                      </Badge>
                    )}
                  </div>
                  <p className="text-caption text-muted-foreground">
                    {receiptCount} receipt{receiptCount !== 1 ? "s" : ""}
                  </p>
                  {merchant.nif && (
                    <p className="text-[11px] text-muted-foreground">NIF: {merchant.nif}</p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-body font-semibold text-foreground">€{totalSpent.toFixed(2)}</p>
                </div>

                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(merchant)} aria-label="Edit store">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(merchant)}
                    aria-label="Delete store"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <MerchantDialog open={dialogOpen} onOpenChange={setDialogOpen} merchant={selectedMerchant} onSave={handleSave} />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Store"
        description={`Are you sure you want to delete "${selectedMerchant?.name}"? Receipts linked to this store will remain.`}
        onConfirm={confirmDelete}
      />
    </AppLayout>
  );
}
