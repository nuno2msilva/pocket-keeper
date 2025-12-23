import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Product, Category } from "@/types/expense";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  categories: Category[];
  onSave: (product: Omit<Product, "id">) => void;
}

export function ProductDialog({ open, onOpenChange, product, categories, onSave }: ProductDialogProps) {
  const [name, setName] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [excludeFromPriceHistory, setExcludeFromPriceHistory] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDefaultPrice(product.defaultPrice?.toString() || "");
      setCategoryId(product.categoryId);
      setExcludeFromPriceHistory(product.excludeFromPriceHistory || false);
    } else {
      setName("");
      setDefaultPrice("");
      setCategoryId(categories[0]?.id || "");
      setExcludeFromPriceHistory(false);
    }
  }, [product, categories, open]);

  const handleSave = () => {
    if (!name.trim() || !categoryId) return;
    onSave({
      name: name.trim(),
      defaultPrice: defaultPrice ? parseFloat(defaultPrice) : undefined,
      categoryId,
      excludeFromPriceHistory,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "New Product"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Milk 1L"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Default Price (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(e.target.value)}
              placeholder="e.g., 1.29"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Exclude from Price History</Label>
              <p className="text-caption text-muted-foreground">
                Use for promo items or variable pricing
              </p>
            </div>
            <Switch
              checked={excludeFromPriceHistory}
              onCheckedChange={setExcludeFromPriceHistory}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !categoryId}>
            {product ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
