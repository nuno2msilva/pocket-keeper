/**
 * ReceiptDialog Component
 * 
 * A dialog/modal for creating or editing receipts.
 * Features:
 * - QR code scanning for Portuguese receipts (mobile only)
 * - Barcode scanning for products (mobile only)
 * - Auto-complete for stores and products
 * - Line item management
 * - Auto-calculated totals with placeholder for unidentified items
 */

import { useState, useRef, useEffect, useMemo } from "react";
import { Plus, Trash2, Camera, ChevronDown, Barcode, AlertTriangle, Package, Pencil, Check, X as XIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Receipt, ReceiptItem, Merchant, Product, ATCUDData } from "@/features/shared";
import { QRScanner } from "./QRScanner";
import { BarcodeScanner } from "./BarcodeScanner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDeviceType } from "@/hooks/useDeviceType";

// Constants
const PLACEHOLDER_PRODUCT_ID = "__placeholder__";
const PLACEHOLDER_PRODUCT_NAME = "Unidentified Items";
const UNCATEGORIZED_CATEGORY_ID = "cat-other";

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
  disabled?: boolean;
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
  disabled = false,
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
        disabled={disabled}
      />
      {showSuggestions && !disabled && (suggestions.length > 0 || (showNew && value.trim() && !isExactMatch)) && (
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

// Extended item type with input tracking
type DialogItem = ReceiptItem & { 
  inputName: string;
  isPlaceholder?: boolean;
};

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
  const [items, setItems] = useState<DialogItem[]>([]);
  const [notes, setNotes] = useState("");
  
  // Scanned total from QR code - can be force-edited if needed
  const [scannedTotal, setScannedTotal] = useState<number | null>(null);
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [editTotalValue, setEditTotalValue] = useState("");
  
  // Scanner visibility (only used on mobile)
  const [showScanner, setShowScanner] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  
  // UI state
  const [showNifDetails, setShowNifDetails] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate totals from real items (excluding placeholder)
  const realItems = useMemo(() => 
    items.filter(item => !item.isPlaceholder), 
    [items]
  );
  
  const realItemsTotal = useMemo(() => 
    realItems.reduce((sum, item) => sum + item.total, 0),
    [realItems]
  );

  // Calculate the difference between scanned total and real items
  const totalDifference = useMemo(() => {
    if (scannedTotal === null) return 0;
    return Math.max(0, scannedTotal - realItemsTotal);
  }, [scannedTotal, realItemsTotal]);

  // Check if items exceed the scanned total
  const itemsExceedTotal = useMemo(() => {
    if (scannedTotal === null) return false;
    return realItemsTotal > scannedTotal + 0.01; // Small tolerance for floating point
  }, [scannedTotal, realItemsTotal]);

  // The display total is either scanned or calculated from items
  const displayTotal = scannedTotal ?? realItemsTotal;

  // Update placeholder item when totals change
  useEffect(() => {
    if (scannedTotal === null) {
      // No scanned total - remove any placeholder
      setItems(prev => prev.filter(item => !item.isPlaceholder));
      return;
    }

    const needsPlaceholder = totalDifference > 0.01;
    const existingPlaceholder = items.find(item => item.isPlaceholder);

    if (needsPlaceholder) {
      if (existingPlaceholder) {
        // Update existing placeholder amount
        if (Math.abs(existingPlaceholder.total - totalDifference) > 0.01) {
          setItems(prev => prev.map(item => 
            item.isPlaceholder 
              ? { ...item, unitPrice: totalDifference, total: totalDifference }
              : item
          ));
        }
      } else {
        // Add new placeholder
        const placeholderItem: DialogItem = {
          id: `placeholder-${Date.now()}`,
          productId: PLACEHOLDER_PRODUCT_ID,
          productName: PLACEHOLDER_PRODUCT_NAME,
          inputName: PLACEHOLDER_PRODUCT_NAME,
          quantity: 1,
          unitPrice: totalDifference,
          total: totalDifference,
          isPlaceholder: true,
          excludeFromPriceHistory: true,
        };
        setItems(prev => [...prev, placeholderItem]);
      }
    } else if (existingPlaceholder) {
      // Remove placeholder when items match or exceed total
      setItems(prev => prev.filter(item => !item.isPlaceholder));
    }
  }, [scannedTotal, totalDifference]);

  // Reset form when dialog opens
  useEffect(() => {
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
        
        // Check if there's a placeholder item in the saved receipt
        const hasPlaceholderItem = receipt.items.some(
          item => item.productId === PLACEHOLDER_PRODUCT_ID
        );
        
        setItems(receipt.items.map((item) => ({ 
          ...item, 
          inputName: item.productName,
          isPlaceholder: item.productId === PLACEHOLDER_PRODUCT_ID,
        })));
        
        // If receipt has a placeholder, calculate what the scanned total was
        if (hasPlaceholderItem) {
          setScannedTotal(receipt.total);
        } else {
          // No placeholder means total was calculated from items
          setScannedTotal(null);
        }
        
        setNotes(receipt.notes || "");
      } else {
        resetForm();
      }
    }
  }, [open, receipt, merchants]);

  const resetForm = () => {
    setMerchantName("");
    setMerchantId("");
    setDate(new Date().toISOString().split("T")[0]);
    setTime("");
    setReceiptNumber("");
    setHasCustomerNif(false);
    setCustomerNif("");
    setItems([]);
    setScannedTotal(null);
    setNotes("");
    setErrors({});
  };

  const handleScanResult = (data: ATCUDData) => {
    setShowScanner(false);
    if (data.date) setDate(data.date);
    if (data.time) setTime(data.time);
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
    
    // Set scanned total - this will trigger placeholder creation
    if (data.total && data.total > 0) {
      setScannedTotal(data.total);
      toast.success(`Receipt scanned: €${data.total.toFixed(2)}`);
    }
  };

  const handleBarcodeScan = (barcode: string) => {
    setShowBarcodeScanner(false);
    
    // Try to find existing product with this barcode
    const existingProduct = onFindProductByBarcode?.(barcode);
    
    if (existingProduct) {
      // Add item with found product
      const newItem: DialogItem = {
        id: `item-${Date.now()}`,
        productId: existingProduct.id,
        productName: existingProduct.name,
        inputName: existingProduct.name,
        quantity: 1,
        unitPrice: existingProduct.defaultPrice || 0,
        total: existingProduct.defaultPrice || 0,
        isPlaceholder: false,
      };
      setItems(prev => [...prev.filter(i => !i.isPlaceholder), newItem]);
      toast.success(`Found: ${existingProduct.name}`);
    } else {
      // Add empty item with barcode info
      const newItem: DialogItem = {
        id: `item-${Date.now()}`,
        productId: "",
        productName: "",
        inputName: `Barcode: ${barcode}`,
        quantity: 1,
        unitPrice: 0,
        total: 0,
        isPlaceholder: false,
      };
      setItems(prev => [...prev.filter(i => !i.isPlaceholder), newItem]);
      toast.info("Product not found. Enter name manually.");
    }
  };

  const addItem = () => {
    const newItem: DialogItem = {
      id: `item-${Date.now()}`,
      productId: "",
      productName: "",
      inputName: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
      isPlaceholder: false,
    };
    // Add before placeholder if one exists
    setItems(prev => {
      const withoutPlaceholder = prev.filter(i => !i.isPlaceholder);
      const placeholder = prev.find(i => i.isPlaceholder);
      return placeholder 
        ? [...withoutPlaceholder, newItem, placeholder]
        : [...withoutPlaceholder, newItem];
    });
  };

  const updateItem = (index: number, updates: Partial<DialogItem>) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], ...updates };
      if ("quantity" in updates || "unitPrice" in updates) {
        newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
      }
      return newItems;
    });
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
    const itemToRemove = items[index];
    if (itemToRemove.isPlaceholder) return; // Can't remove placeholder manually
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!merchantName.trim()) {
      newErrors.merchant = "Store name is required";
    }
    if (!date) {
      newErrors.date = "Date is required";
    }
    if (itemsExceedTotal) {
      newErrors.items = `Items total (€${realItemsTotal.toFixed(2)}) exceeds receipt total (€${scannedTotal?.toFixed(2)})`;
    }
    // When no scanned total, need at least one real item
    if (scannedTotal === null && realItems.length === 0) {
      newErrors.items = "Add at least one item";
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

    // Process items - create products for new items
    const processedItems: ReceiptItem[] = items
      .map((item) => {
        if (item.isPlaceholder) {
          // Keep placeholder as-is, it belongs to "Other/Uncategorized" category
          return {
            id: item.id,
            productId: PLACEHOLDER_PRODUCT_ID,
            productName: PLACEHOLDER_PRODUCT_NAME,
            quantity: 1,
            unitPrice: item.total,
            total: item.total,
            excludeFromPriceHistory: true,
          };
        }
        
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
      .filter((item) => item.productName.trim() || item.productId === PLACEHOLDER_PRODUCT_ID);

    // Final total is the scanned total or calculated from items
    const finalTotal = scannedTotal ?? processedItems.reduce((sum, item) => sum + item.total, 0);

    onSave({
      merchantId: finalMerchantId,
      date,
      time: time || undefined,
      receiptNumber: receiptNumber || undefined,
      hasCustomerNif,
      customerNif: hasCustomerNif ? customerNif : undefined,
      items: processedItems,
      total: finalTotal,
      notes: notes || undefined,
    });
    onOpenChange(false);
  };

  // Clear scanned total (allow user to remove the constraint)
  const handleClearScannedTotal = () => {
    setScannedTotal(null);
    setIsEditingTotal(false);
    toast.info("Scanned total cleared. Total will be calculated from items.");
  };

  // Start editing the scanned total
  const handleStartEditTotal = () => {
    setEditTotalValue(scannedTotal?.toFixed(2) || "0.00");
    setIsEditingTotal(true);
  };

  // Confirm the edited total
  const handleConfirmEditTotal = () => {
    const newTotal = parseFloat(editTotalValue);
    if (!isNaN(newTotal) && newTotal >= 0) {
      setScannedTotal(newTotal);
      setIsEditingTotal(false);
      toast.success(`Total updated to €${newTotal.toFixed(2)}`);
    } else {
      toast.error("Please enter a valid amount");
    }
  };

  // Cancel editing
  const handleCancelEditTotal = () => {
    setIsEditingTotal(false);
    setEditTotalValue("");
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

          {/* Total Display */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {scannedTotal !== null ? "Receipt Total" : "Calculated Total"}
                </span>
                {scannedTotal !== null && (
                  <Badge variant="secondary" className="text-xs">
                    {isEditingTotal ? "Editing" : "From QR"}
                  </Badge>
                )}
              </div>
              
              {/* Total display/edit */}
              {isEditingTotal ? (
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold">€</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editTotalValue}
                    onChange={(e) => setEditTotalValue(e.target.value)}
                    className="w-24 h-8 text-right font-bold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleConfirmEditTotal();
                      if (e.key === "Escape") handleCancelEditTotal();
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleConfirmEditTotal}
                    className="text-green-600 hover:text-green-700 hover:bg-green-100"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleCancelEditTotal}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <XIcon className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    €{displayTotal.toFixed(2)}
                  </span>
                  {scannedTotal !== null && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleStartEditTotal}
                      className="text-muted-foreground hover:text-foreground"
                      title="Edit total"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {scannedTotal !== null && !isEditingTotal && (
              <>
                <div className="flex justify-between text-sm border-t border-border pt-2">
                  <span className="text-muted-foreground">Items subtotal:</span>
                  <span className={cn(itemsExceedTotal && "text-destructive font-medium")}>
                    €{realItemsTotal.toFixed(2)}
                  </span>
                </div>
                {totalDifference > 0.01 && (
                  <div className="flex justify-between text-sm text-amber-600 dark:text-amber-400">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Unidentified:
                    </span>
                    <span>€{totalDifference.toFixed(2)}</span>
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full mt-1 text-xs"
                  onClick={handleClearScannedTotal}
                >
                  Clear scanned total
                </Button>
              </>
            )}
          </div>

          {/* Warning when items exceed scanned total */}
          {itemsExceedTotal && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Items exceed receipt total
                </p>
                <p className="text-xs text-destructive/80">
                  Remove items or adjust prices to match the scanned total of €{scannedTotal?.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {errors.items && !itemsExceedTotal && (
            <p className="text-sm text-destructive">{errors.items}</p>
          )}

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
                {scannedTotal !== null 
                  ? "Add items to identify your purchases. Unidentified amount will be tracked separately."
                  : "No items yet. Add products to your receipt."}
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={cn(
                      "p-3 rounded-lg space-y-2",
                      item.isPlaceholder 
                        ? "bg-amber-50 dark:bg-amber-950/30 border border-dashed border-amber-300 dark:border-amber-700" 
                        : "bg-secondary"
                    )}
                  >
                    {item.isPlaceholder ? (
                      // Placeholder item display
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                            {PLACEHOLDER_PRODUCT_NAME}
                          </span>
                          <Badge variant="outline" className="text-xs border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400">
                            Auto
                          </Badge>
                        </div>
                        <span className="font-semibold text-amber-700 dark:text-amber-300">
                          €{item.total.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      // Regular item
                      <>
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
                            <Label className="text-[11px]">
                              {products.find(p => p.id === item.productId)?.isWeighted ? "Weight" : "Qty"}
                            </Label>
                            <Input
                              type="number"
                              min={products.find(p => p.id === item.productId)?.isWeighted ? "0.001" : "1"}
                              step={products.find(p => p.id === item.productId)?.isWeighted ? "0.001" : "1"}
                              value={item.quantity}
                              onChange={(e) => {
                                const isWeighted = products.find(p => p.id === item.productId)?.isWeighted;
                                const qty = isWeighted 
                                  ? parseFloat(e.target.value) || 0.001
                                  : parseInt(e.target.value) || 1;
                                updateItem(index, { quantity: qty });
                              }}
                              aria-label={products.find(p => p.id === item.productId)?.isWeighted ? "Weight" : "Quantity"}
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
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
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
          <Button onClick={handleSave} disabled={itemsExceedTotal}>
            {receipt ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
