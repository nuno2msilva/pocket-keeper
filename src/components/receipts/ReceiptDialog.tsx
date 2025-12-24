import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Camera, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Receipt, ReceiptItem, Merchant, Product, ATCUDData } from "@/types/expense";
import { QRScanner } from "@/components/scanner/QRScanner";
import { cn } from "@/lib/utils";

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt?: Receipt | null;
  merchants: Merchant[];
  products: Product[];
  onSave: (receipt: Omit<Receipt, "id">) => void;
  onFindMerchantByNif?: (nif: string) => Merchant | undefined;
  onGetOrCreateProduct?: (name: string) => Product;
}

// Simple fuzzy search
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

interface ProductInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (product: Product) => void;
  products: Product[];
  placeholder?: string;
}

function ProductInput({ value, onChange, onSelect, products, placeholder }: ProductInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const suggestions = value.trim()
    ? products.filter(p => fuzzyMatch(value, p.name)).slice(0, 6)
    : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      onSelect(suggestions[focusedIndex]);
      setShowSuggestions(false);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

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
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={listRef}
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
        >
          {suggestions.map((product, index) => (
            <button
              key={product.id}
              type="button"
              className={cn(
                "w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors",
                focusedIndex === index && "bg-secondary"
              )}
              onMouseDown={() => onSelect(product)}
            >
              <span className="font-medium">{product.name}</span>
              {product.defaultPrice && (
                <span className="text-muted-foreground ml-2">€{product.defaultPrice.toFixed(2)}</span>
              )}
              {!product.isSolidified && (
                <span className="ml-2 text-xs bg-warning/20 text-warning px-1.5 py-0.5 rounded">new</span>
              )}
            </button>
          ))}
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
  onFindMerchantByNif,
  onGetOrCreateProduct,
}: ReceiptDialogProps) {
  const [merchantId, setMerchantId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [hasCustomerNif, setHasCustomerNif] = useState(false);
  const [customerNif, setCustomerNif] = useState("");
  const [items, setItems] = useState<(ReceiptItem & { inputName: string })[]>([]);
  const [total, setTotal] = useState("");
  const [notes, setNotes] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [showNifDetails, setShowNifDetails] = useState(false);

  useEffect(() => {
    if (receipt) {
      setMerchantId(receipt.merchantId);
      setDate(receipt.date);
      setTime(receipt.time || "");
      setReceiptNumber(receipt.receiptNumber || "");
      setHasCustomerNif(receipt.hasCustomerNif);
      setCustomerNif(receipt.customerNif || "");
      setItems(receipt.items.map(item => ({ ...item, inputName: item.productName })));
      setTotal(receipt.total.toString());
      setNotes(receipt.notes || "");
    } else {
      resetForm();
    }
  }, [receipt, open]);

  const resetForm = () => {
    setMerchantId(merchants[0]?.id || "");
    setDate(new Date().toISOString().split("T")[0]);
    setTime("");
    setReceiptNumber("");
    setHasCustomerNif(false);
    setCustomerNif("");
    setItems([]);
    setTotal("");
    setNotes("");
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
    
    if (data.nif && onFindMerchantByNif) {
      const foundMerchant = onFindMerchantByNif(data.nif);
      if (foundMerchant) {
        setMerchantId(foundMerchant.id);
      }
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

  const handleSave = () => {
    if (!merchantId || !date) return;
    
    // Process items - create products if needed
    const processedItems: ReceiptItem[] = items.map(item => {
      let productId = item.productId;
      let productName = item.productName || item.inputName;
      
      // If no product selected but name typed, create/get product
      if (!productId && item.inputName.trim() && onGetOrCreateProduct) {
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
    }).filter(item => item.productName.trim()); // Remove empty items
    
    const calculatedTotal = processedItems.reduce((sum, item) => sum + item.total, 0);
    
    onSave({
      merchantId,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{receipt ? "Edit Receipt" : "New Receipt"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* QR Scanner Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setShowScanner(true)}
          >
            <Camera className="w-5 h-5 mr-2" />
            Scan Receipt QR Code
          </Button>

          {/* Merchant */}
          <div className="space-y-2">
            <Label>Merchant *</Label>
            <Select value={merchantId} onValueChange={setMerchantId}>
              <SelectTrigger>
                <SelectValue placeholder="Select merchant" />
              </SelectTrigger>
              <SelectContent>
                {merchants.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Receipt Number */}
          <div className="space-y-2">
            <Label>Receipt Number</Label>
            <Input
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
                  checked={hasCustomerNif}
                  onCheckedChange={setHasCustomerNif}
                />
                <span className="text-body font-medium">
                  Requested NIF for taxes?
                </span>
              </div>
              {hasCustomerNif && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <ChevronDown className={`w-4 h-4 transition-transform ${showNifDetails ? "rotate-180" : ""}`} />
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
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addItem}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-caption text-muted-foreground text-center py-4">
                No items yet. Add products or just enter the total.
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 bg-secondary rounded-lg space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <ProductInput
                          value={item.inputName}
                          onChange={(value) => updateItem(index, { inputName: value, productName: value })}
                          onSelect={(product) => handleProductSelect(index, product)}
                          products={products}
                          placeholder="Type product name..."
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(index)}
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
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Total</Label>
                        <Input
                          value={`€${item.total.toFixed(2)}`}
                          disabled
                          className="bg-muted"
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
            <Label>Total (€) *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder={
                items.length > 0
                  ? `Auto: ${items.reduce((s, i) => s + i.total, 0).toFixed(2)}`
                  : "0.00"
              }
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
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
          <Button onClick={handleSave} disabled={!merchantId || !date}>
            {receipt ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
