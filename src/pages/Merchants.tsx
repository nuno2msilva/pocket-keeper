import { useState } from "react";
import { Plus, Store, Pencil, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { MerchantDialog } from "@/components/merchants/MerchantDialog";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";
import { useMerchants, useCategories, useReceipts } from "@/hooks/useLocalStorage";
import { Merchant } from "@/types/expense";
import { toast } from "sonner";

export default function Merchants() {
  const { merchants, addMerchant, updateMerchant, deleteMerchant } = useMerchants();
  const { categories } = useCategories();
  const { receipts } = useReceipts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  const getCategory = (categoryId: string) => 
    categories.find(c => c.id === categoryId);

  const getReceiptCount = (merchantId: string) =>
    receipts.filter(r => r.merchantId === merchantId).length;

  const getTotalSpent = (merchantId: string) =>
    receipts
      .filter(r => r.merchantId === merchantId)
      .reduce((sum, r) => sum + r.total, 0);

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
      updateMerchant(selectedMerchant.id, data);
      toast.success("Merchant updated");
    } else {
      addMerchant(data);
      toast.success("Merchant created");
    }
  };

  const confirmDelete = () => {
    if (selectedMerchant) {
      deleteMerchant(selectedMerchant.id);
      toast.success("Merchant deleted");
      setDeleteDialogOpen(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Merchants" 
        subtitle={`${merchants.length} saved`}
        action={
          <Button size="icon" variant="default" onClick={handleAdd}>
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
            onAction={handleAdd}
          />
        ) : (
          merchants.map(merchant => {
            const category = getCategory(merchant.categoryId);
            const receiptCount = getReceiptCount(merchant.id);
            const totalSpent = getTotalSpent(merchant.id);
            
            return (
              <div
                key={merchant.id}
                className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 animate-fade-in"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: category?.color ? `${category.color}20` : 'hsl(var(--secondary))' }}
                >
                  {category?.icon || "🏪"}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-body font-semibold text-foreground truncate">
                    {merchant.name}
                  </h3>
                  <p className="text-caption text-muted-foreground">
                    {category?.name || "Uncategorized"} • {receiptCount} receipt{receiptCount !== 1 ? "s" : ""}
                  </p>
                  {merchant.nif && (
                    <p className="text-[11px] text-muted-foreground">NIF: {merchant.nif}</p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-body font-semibold text-foreground">
                    €{totalSpent.toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleEdit(merchant)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(merchant)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <MerchantDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        merchant={selectedMerchant}
        categories={categories}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Merchant"
        description={`Are you sure you want to delete "${selectedMerchant?.name}"? Receipts linked to this merchant will remain.`}
        onConfirm={confirmDelete}
      />
    </AppLayout>
  );
}
