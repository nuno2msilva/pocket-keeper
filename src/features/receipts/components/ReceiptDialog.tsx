/**
 * ReceiptDialog Component
 * 
 * A dialog/modal for creating or editing receipts.
 * Features:
 * - QR code scanning for Portuguese receipts (mobile only)
 * - Barcode scanning for products (mobile only)
 * - Auto-complete for stores and products
 * - Line item management
 */

import { useState, useRef } from "react";
import { Plus, Trash2, Camera, ChevronDown, Barcode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Receipt, ReceiptItem, Merchant, Product, ATCUDData } from "@/features/shared";
import { QRScanner } from "./QRScanner";
import { BarcodeScanner } from "./BarcodeScanner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDeviceType } from "@/hooks/useDeviceType";

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt?: Receipt | null;
  merchants: Merchant[];
  products: Product[];
  onSave: (receipt: Omit<Receipt, "id">) => void;
  onGetOrCreateProduct: (name: string) => Product;
  onGetOrCreateMerchant: (name: string, nif?: string) => Merchant;
  onSearchMerchants: (query: string) => Merchant[];
  onFindProductByBarcode?: (barcode: string) => Product | undefined;
}

function fuzzyMatch(query: string, text: string): boolean {
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  if (lowerText.includes(lowerQuery)) return true;
  let queryIdx = 0;
  for (const char of lowerText) {
    if (char === lowerQuery[queryIdx]) {
      queryIdx++;
      if (queryIdx === lowerQuery.length) return true;
    }
  }
  return false;
}

interface AutocompleteInputProps<T> {
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: T) => void;
  items: T[];
  getLabel: (item: T) => string;
  getSubLabel?: (item: T) => string | undefined;
  placeholder?: string;
  showNew?: boolean;
}

function AutocompleteInput<T extends { id: string }>({
  value,
  onChange,
  onSelect,
  items,
  getLabel,
  getSubLabel,
  placeholder,
  showNew = true,
}: AutocompleteInputProps<T>) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = value.trim()
    ? items.filter((item) => fuzzyMatch(value, getLabel(item))).slice(0, 6)
    : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      onSelect(suggestions[focusedIndex]);
      setShowSuggestions(false);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const isExactMatch = suggestions.some(
    (s) => getLabel(s).toLowerCase() === value.toLowerCase()
  );

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
          setFocusedIndex(-1);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      {showSuggestions && (suggestions.length > 0 || (showNew && value.trim() && !isExactMatch)) && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
          {suggestions.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors",
                focusedIndex === index && "bg-secondary"
              )}
              onMouseDown={() => onSelect(item)}
            >
              <span className="font-medium">{getLabel(item)}</span>
              {getSubLabel?.(item) && (
                <span className="text-muted-foreground ml-2 text-xs">
                  {getSubLabel(item)}
                </span>
              )}
            </button>
          ))}
          {showNew && value.trim() && !isExactMatch && (
            <div className="px-3 py-2 text-sm text-muted-foreground border-t border-border">
              Press Enter to create "{value.trim()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ReceiptDialog({
  open,
  onOpenChange,
  receipt,
  merchants,
  products,
  onSave,
  onGetOrCreateProduct,
  onGetOrCreateMerchant,
  onSearchMerchants,
  onFindProductByBarcode,
}: ReceiptDialogProps) {
  // Check device type to enable/disable scanner features
  const { canUseScanners } = useDeviceType();
  
  // Form state
  const [merchantName, setMerchantName] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [hasCustomerNif, setHasCustomerNif] = useState(false);
  const [customerNif, setCustomerNif] = useState("");
  const [items, setItems] = useState<(ReceiptItem & { inputName: string })[]>([]);
  const [total, setTotal] = useState("");
  const [notes, setNotes] = useState("");
  
  // Scanner visibility (only used on mobile)
  const [showScanner, setShowScanner] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  
  // UI state
  const [showNifDetails, setShowNifDetails] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens
  useState(() => {
    if (open) {
      if (receipt) {
        const m = merchants.find((m) => m.id === receipt.merchantId);
        setMerchantName(m?.name || "");
        setMerchantId(receipt.merchantId);
        setDate(receipt.date);
        setTime(receipt.time || "");
        setReceiptNumber(receipt.receiptNumber || "");
        setHasCustomerNif(receipt.hasCustomerNif);
        setCustomerNif(receipt.customerNif || "");
        setItems(receipt.items.map((item) => ({ ...item, inputName: item.productName })));
        setTotal(receipt.total.toString());
        setNotes(receipt.notes || "");
      } else {
        resetForm();
      }
    }
  });

  const resetForm = () => {
    setMerchantName("");
    setMerchantId("");
    setDate(new Date().toISOString().split("T")[0]);
    setTime("");
    setReceiptNumber("");
    setHasCustomerNif(false);
    setCustomerNif("");
    setItems([]);
    setTotal("");
    setNotes("");
    setErrors({});
  };

  const handleScanResult = (data: ATCUDData) => {
    setShowScanner(false);
    if (data.date) setDate(data.date);
    if (data.time) setTime(data.time);
    if (data.total) setTotal(data.total.toString());
    if (data.receiptNumber) setReceiptNumber(data.receiptNumber);
    if (data.customerNif) {
      setHasCustomerNif(true);
      setCustomerNif(data.customerNif);
    }
    if (data.nif) {
      const foundMerchant = merchants.find((m) => m.nif === data.nif);
      if (foundMerchant) {
        setMerchantId(foundMerchant.id);
        setMerchantName(foundMerchant.name);
      }
    }
  };

  const handleBarcodeScan = (barcode: string) => {
    setShowBarcodeScanner(false);
    
    // Try to find existing product with this barcode
    const existingProduct = onFindProductByBarcode?.(barcode);
    
    if (existingProduct) {
      // Add item with found product
      const newItem: ReceiptItem & { inputName: string } = {
        id: `item-${Date.now()}`,
        productId: existingProduct.id,
        productName: existingProduct.name,
        inputName: existingProduct.name,
        quantity: 1,
        unitPrice: existingProduct.defaultPrice || 0,
        total: existingProduct.defaultPrice || 0,
      };
      setItems([...items, newItem]);
      toast.success(`Found: ${existingProduct.name}`);
    } else {
      // Add empty item with barcode info
      const newItem: ReceiptItem & { inputName: string } = {
        id: `item-${Date.now()}`,
        productId: "",
        productName: "",
        inputName: `Barcode: ${barcode}`,
        quantity: 1,
        unitPrice: 0,
        total: 0,
      };
      setItems([...items, newItem]);
      toast.info("Product not found. Enter name manually.");
    }
  };

  const addItem = () => {
    const newItem: ReceiptItem & { inputName: string } = {
      id: `item-${Date.now()}`,
      productId: "",
      productName: "",
      inputName: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, updates: Partial<ReceiptItem & { inputName: string }>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    if ("quantity" in updates || "unitPrice" in updates) {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    setItems(newItems);
  };

  const handleProductSelect = (index: number, product: Product) => {
    updateItem(index, {
      productId: product.id,
      productName: product.name,
      inputName: product.name,
      unitPrice: product.defaultPrice || items[index].unitPrice,
      total: (product.defaultPrice || items[index].unitPrice) * items[index].quantity,
    });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!merchantName.trim()) {
      newErrors.merchant = "Store name is required";
    }
    if (!date) {
      newErrors.date = "Date is required";
    }
    if (!total && items.length === 0) {
      newErrors.total = "Total or items required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    // Get or create merchant
    let finalMerchantId = merchantId;
    if (!finalMerchantId && merchantName.trim()) {
      const merchant = onGetOrCreateMerchant(merchantName.trim());
      finalMerchantId = merchant.id;
    }

    // Process items
    const processedItems: ReceiptItem[] = items
      .map((item) => {
        let productId = item.productId;
        let productName = item.productName || item.inputName;
        if (!productId && item.inputName.trim()) {
          const product = onGetOrCreateProduct(item.inputName.trim());
          productId = product.id;
          productName = product.name;
        }
        return {
          id: item.id,
          productId,
          productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        };
      })
      .filter((item) => item.productName.trim());

    const calculatedTotal = processedItems.reduce((sum, item) => sum + item.total, 0);

    onSave({
      merchantId: finalMerchantId,
      date,
      time: time || undefined,
      receiptNumber: receiptNumber || undefined,
      hasCustomerNif,
      customerNif: hasCustomerNif ? customerNif : undefined,
      items: processedItems,
      total: parseFloat(total) || calculatedTotal,
      notes: notes || undefined,
    });
    onOpenChange(false);
  };

  if (showScanner) {
    return <QRScanner onScan={handleScanResult} onClose={() => setShowScanner(false)} />;
  }

  if (showBarcodeScanner) {
    return <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowBarcodeScanner(false)} />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{receipt ? "Edit Receipt" : "New Receipt"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* QR Scanner button - only visible on mobile devices */}
          {canUseScanners && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowScanner(true)}
            >
              <Camera className="w-5 h-5 mr-2" aria-hidden="true" />
              Scan Receipt QR Code
            </Button>
          )}

          {/* Store */}
          <div className="space-y-2">
            <Label htmlFor="merchant">Store *</Label>
            <AutocompleteInput
              value={merchantName}
              onChange={(value) => {
                setMerchantName(value);
                setMerchantId("");
                setErrors((e) => ({ ...e, merchant: "" }));
              }}
              onSelect={(merchant) => {
                setMerchantName(merchant.name);
                setMerchantId(merchant.id);
              }}
              items={onSearchMerchants(merchantName)}
              getLabel={(m) => m.name}
              getSubLabel={(m) => m.address}
              placeholder="Type store name..."
            />
            {errors.merchant && (
              <p className="text-sm text-destructive">{errors.merchant}</p>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setErrors((err) => ({ ...err, date: "" }));
                }}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Receipt Number */}
          <div className="space-y-2">
            <Label htmlFor="receiptNumber">Receipt Number</Label>
            <Input
              id="receiptNumber"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder="e.g., FT 2024/12345"
            />
          </div>

          {/* Customer NIF Toggle */}
          <Collapsible open={showNifDetails} onOpenChange={setShowNifDetails}>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <Switch
                  id="hasNif"
                  checked={hasCustomerNif}
                  onCheckedChange={setHasCustomerNif}
                />
                <Label htmlFor="hasNif" className="text-body font-medium cursor-pointer">
                  Requested NIF for taxes?
                </Label>
              </div>
              {hasCustomerNif && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Toggle NIF details">
                    <ChevronDown
                      className={cn("w-4 h-4 transition-transform", showNifDetails && "rotate-180")}
                    />
                  </Button>
                </CollapsibleTrigger>
              )}
            </div>
            <CollapsibleContent className="pt-2">
              <Input
                value={customerNif}
                onChange={(e) => setCustomerNif(e.target.value)}
                placeholder="Your NIF (e.g., 123456789)"
                maxLength={9}
                aria-label="Customer NIF"
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              <div className="flex gap-1">
                {/* Barcode scanner button - only visible on mobile devices */}
                {canUseScanners && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowBarcodeScanner(true)}
                    aria-label="Scan barcode"
                  >
                    <Barcode className="w-4 h-4" />
                  </Button>
                )}
                <Button type="button" variant="ghost" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
                  Add
                </Button>
              </div>
            </div>

            {items.length === 0 ? (
              <p className="text-caption text-muted-foreground text-center py-4">
                No items yet. Add products or just enter the total.
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="p-3 bg-secondary rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <AutocompleteInput
                          value={item.inputName}
                          onChange={(value) =>
                            updateItem(index, { inputName: value, productName: value })
                          }
                          onSelect={(product) => handleProductSelect(index, product)}
                          items={products.filter((p) => fuzzyMatch(item.inputName, p.name))}
                          getLabel={(p) => p.name}
                          getSubLabel={(p) =>
                            p.defaultPrice ? `€${p.defaultPrice.toFixed(2)}` : undefined
                          }
                          placeholder="Type product name..."
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(index)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-[11px]">Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, { quantity: parseInt(e.target.value) || 1 })
                          }
                          aria-label="Quantity"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(index, { unitPrice: parseFloat(e.target.value) || 0 })
                          }
                          aria-label="Unit price"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Total</Label>
                        <Input
                          value={`€${item.total.toFixed(2)}`}
                          disabled
                          className="bg-muted"
                          aria-label="Item total"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="space-y-2">
            <Label htmlFor="total">Total (€) *</Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              min="0"
              value={total}
              onChange={(e) => {
                setTotal(e.target.value);
                setErrors((err) => ({ ...err, total: "" }));
              }}
              placeholder={
                items.length > 0
                  ? `Auto: ${items.reduce((s, i) => s + i.total, 0).toFixed(2)}`
                  : "0.00"
              }
            />
            {errors.total && <p className="text-sm text-destructive">{errors.total}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{receipt ? "Save" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
