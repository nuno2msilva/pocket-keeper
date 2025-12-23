import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Merchant, Category } from "@/types/expense";

interface MerchantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant?: Merchant | null;
  categories: Category[];
  onSave: (merchant: Omit<Merchant, "id">) => void;
}

export function MerchantDialog({ open, onOpenChange, merchant, categories, onSave }: MerchantDialogProps) {
  const [name, setName] = useState("");
  const [nif, setNif] = useState("");
  const [address, setAddress] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    if (merchant) {
      setName(merchant.name);
      setNif(merchant.nif || "");
      setAddress(merchant.address || "");
      setCategoryId(merchant.categoryId);
    } else {
      setName("");
      setNif("");
      setAddress("");
      setCategoryId(categories[0]?.id || "");
    }
  }, [merchant, categories, open]);

  const handleSave = () => {
    if (!name.trim() || !categoryId) return;
    onSave({
      name: name.trim(),
      nif: nif.trim() || undefined,
      address: address.trim() || undefined,
      categoryId,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{merchant ? "Edit Merchant" : "New Merchant"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Continente"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nif">NIF (Tax ID)</Label>
            <Input
              id="nif"
              value={nif}
              onChange={(e) => setNif(e.target.value)}
              placeholder="e.g., 500100144"
              maxLength={9}
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

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., Rua Augusta 123, Lisboa"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !categoryId}>
            {merchant ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
