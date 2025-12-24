import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Merchant } from "@/features/shared";

interface MerchantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant?: Merchant | null;
  onSave: (merchant: Omit<Merchant, "id">) => void;
}

export function MerchantDialog({ open, onOpenChange, merchant, onSave }: MerchantDialogProps) {
  const [name, setName] = useState("");
  const [nif, setNif] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (merchant) {
      setName(merchant.name);
      setNif(merchant.nif || "");
      setAddress(merchant.address || "");
    } else {
      setName("");
      setNif("");
      setAddress("");
    }
    setErrors({});
  }, [merchant, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (nif && !/^\d{9}$/.test(nif)) newErrors.nif = "NIF must be 9 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      name: name.trim(),
      nif: nif.trim() || undefined,
      address: address.trim() || undefined,
      isSolidified: true,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{merchant ? "Edit Store" : "New Store"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Continente" />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nif">NIF (Tax ID)</Label>
            <Input id="nif" value={nif} onChange={(e) => setNif(e.target.value)} placeholder="e.g., 500100144" maxLength={9} />
            {errors.nif && <p className="text-sm text-destructive">{errors.nif}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., Rua Augusta 123" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>{merchant ? "Save" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
