import { useParams, useNavigate } from "react-router-dom";
import { Check, X, Pencil, Trash2, MapPin, Clock, Receipt } from "lucide-react";
import { AppLayout, PageHeader, DeleteConfirmDialog, useReceipts, useMerchants, useProducts, useCategories } from "@/features/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

export default function ReceiptDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { receipts, deleteReceipt } = useReceipts();
  const { merchants } = useMerchants();
  const { products } = useProducts();
  const { categories } = useCategories();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const receipt = receipts.find((r) => r.id === id);
  const merchant = receipt ? merchants.find((m) => m.id === receipt.merchantId) : null;

  if (!receipt) {
    return (
      <AppLayout>
        <PageHeader title="Receipt not found" backTo="/" />
        <div className="p-4 text-center text-muted-foreground">
          This receipt doesn't exist or has been deleted.
        </div>
      </AppLayout>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-PT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getProductCategory = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product?.categoryId) return null;
    return categories.find((c) => c.id === product.categoryId);
  };

  const handleDelete = () => {
    deleteReceipt(receipt.id);
    toast.success("Receipt deleted");
    navigate("/");
  };

  return (
    <AppLayout>
      <PageHeader
        title={merchant?.name || "Unknown Store"}
        subtitle={formatDate(receipt.date)}
        backTo="/"
        action={
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/receipts/${receipt.id}/edit`)}
              aria-label="Edit receipt"
            >
              <Pencil className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
              aria-label="Delete receipt"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        }
      />

      <div className="p-4 space-y-6">
        {/* Total */}
        <div className="text-center py-6 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground text-sm mb-1">Total</p>
          <p className="text-4xl font-bold text-primary">€{receipt.total.toFixed(2)}</p>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-3">
          {receipt.time && (
            <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
              <Clock className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm">{receipt.time}</span>
            </div>
          )}
          {merchant?.address && (
            <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
              <MapPin className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm truncate">{merchant.address}</span>
            </div>
          )}
          {receipt.receiptNumber && (
            <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg col-span-2">
              <Receipt className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm">{receipt.receiptNumber}</span>
            </div>
          )}
        </div>

        {/* NIF Status */}
        <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
          <span className="text-sm font-medium">Tax NIF requested:</span>
          {receipt.hasCustomerNif ? (
            <Badge variant="secondary" className="flex items-center gap-1 bg-success/20 text-success border-success/30">
              <Check className="w-3 h-3" />
              Yes
              {receipt.customerNif && (
                <span className="opacity-70 ml-1">({receipt.customerNif})</span>
              )}
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <X className="w-3 h-3" />
              No
            </Badge>
          )}
        </div>

        {/* Items */}
        {receipt.items.length > 0 && (
          <section aria-label="Receipt items">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Items ({receipt.items.length})
            </h2>
            <div className="space-y-2">
              {receipt.items.map((item) => {
                const category = getProductCategory(item.productId);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                      style={{
                        backgroundColor: category?.color
                          ? `${category.color}20`
                          : "hsl(var(--secondary))",
                      }}
                      aria-hidden="true"
                    >
                      {category?.icon || "📦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × €{item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold shrink-0">€{item.total.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Notes */}
        {receipt.notes && (
          <section aria-label="Notes">
            <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Notes
            </h2>
            <p className="p-3 bg-muted rounded-lg text-sm">{receipt.notes}</p>
          </section>
        )}
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Receipt"
        description="Are you sure you want to delete this receipt? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </AppLayout>
  );
}
