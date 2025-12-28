import { useState, useMemo } from "react";
import { Plus, Store, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Merchant } from "@/features/shared/types";
import { cn } from "@/lib/utils";

interface AddPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  merchants: Merchant[];
  onSave: (price: number, merchantId: string, merchantName: string, isNew: boolean) => void;
  searchMerchants: (query: string) => Merchant[];
}

export function AddPriceDialog({
  open,
  onOpenChange,
  productName,
  merchants,
  onSave,
  searchMerchants,
}: AddPriceDialogProps) {
  const [price, setPrice] = useState("");
  const [merchantInput, setMerchantInput] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fuzzy search merchants
  const suggestions = useMemo(() => {
    if (!merchantInput.trim() || selectedMerchant) return [];
    return searchMerchants(merchantInput);
  }, [merchantInput, selectedMerchant, searchMerchants]);

  // Check if input matches an existing merchant exactly
  const exactMatch = useMemo(() => {
    const lowerInput = merchantInput.toLowerCase().trim();
    return merchants.find((m) => m.name.toLowerCase() === lowerInput);
  }, [merchantInput, merchants]);

  const handleReset = () => {
    setPrice("");
    setMerchantInput("");
    setSelectedMerchant(null);
    setShowSuggestions(false);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleSelectMerchant = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setMerchantInput(merchant.name);
    setShowSuggestions(false);
  };

  const handleMerchantInputChange = (value: string) => {
    setMerchantInput(value);
    setSelectedMerchant(null);
    setShowSuggestions(true);
  };

  const handleSave = () => {
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) return;
    if (!merchantInput.trim()) return;

    if (selectedMerchant) {
      onSave(priceValue, selectedMerchant.id, selectedMerchant.name, false);
    } else if (exactMatch) {
      onSave(priceValue, exactMatch.id, exactMatch.name, false);
    } else {
      // New merchant will be created
      onSave(priceValue, "", merchantInput.trim(), true);
    }
    
    handleClose();
  };

  const isValid = () => {
    const priceValue = parseFloat(price);
    return !isNaN(priceValue) && priceValue > 0 && merchantInput.trim().length > 0;
  };

  const isNewMerchant = !selectedMerchant && !exactMatch && merchantInput.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Price for {productName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Price Input */}
          <div className="space-y-2">
            <Label htmlFor="price">Price (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              autoFocus
            />
          </div>

          {/* Merchant Input with Fuzzy Search */}
          <div className="space-y-2 relative">
            <Label htmlFor="merchant">Merchant / Store</Label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="merchant"
                placeholder="Type to search or create..."
                value={merchantInput}
                onChange={(e) => handleMerchantInputChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-9"
              />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                {suggestions.map((merchant) => (
                  <button
                    key={merchant.id}
                    type="button"
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors",
                      "flex items-center gap-2"
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectMerchant(merchant)}
                  >
                    <Store className="w-4 h-4 text-muted-foreground" />
                    <span>{merchant.name}</span>
                    {merchant.nif && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        NIF: {merchant.nif}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* New Merchant Indicator */}
            {isNewMerchant && !showSuggestions && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Plus className="w-3 h-3" />
                New merchant will be created
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid()}>
            Add Price
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
