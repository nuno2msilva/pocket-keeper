import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Product, Category, Subcategory } from "@/features/shared";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  categories: Category[];
  subcategories: Subcategory[];
  onSave: (product: Omit<Product, "id">) => void;
  onAddSubcategory?: (subcategory: Omit<Subcategory, "id">) => Subcategory;
}

export function ProductDialog({ open, onOpenChange, product, categories, subcategories, onSave, onAddSubcategory }: ProductDialogProps) {
  const [name, setName] = useState("");
  const [hasBarcode, setHasBarcode] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [subcategoryInput, setSubcategoryInput] = useState("");
  const [showSubcategorySuggestions, setShowSubcategorySuggestions] = useState(false);
  const [isWeighted, setIsWeighted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>();
  const subcategoryInputRef = useRef<HTMLInputElement>(null);

  const filteredSubcategories = categoryId ? subcategories.filter((s) => s.parentCategoryId === categoryId) : [];
  
  // Filter suggestions based on input
  const subcategorySuggestions = subcategoryInput.trim()
    ? filteredSubcategories.filter((s) => s.name.toLowerCase().includes(subcategoryInput.toLowerCase()))
    : filteredSubcategories;

  // Check if input matches an existing subcategory exactly
  const exactMatch = filteredSubcategories.find(
    (s) => s.name.toLowerCase() === subcategoryInput.trim().toLowerCase()
  );

  useEffect(() => {
    if (product) {
      setName(product.name);
      const productHasBarcode = !!product.barcode && product.barcode !== "N/A";
      setHasBarcode(productHasBarcode);
      setBarcode(productHasBarcode ? product.barcode! : "");
      setCategoryId(product.categoryId || "");
      setSubcategoryId(product.subcategoryId || "");
      const existingSub = subcategories.find((s) => s.id === product.subcategoryId);
      setSubcategoryInput(existingSub?.name || "");
      setIsWeighted(product.isWeighted || false);
    } else {
      setName("");
      setHasBarcode(false);
      setBarcode("");
      setCategoryId("");
      setSubcategoryId("");
      setSubcategoryInput("");
      setIsWeighted(false);
    }
    setErrors({});
  }, [product, open, subcategories]);

  useEffect(() => {
    // Reset subcategory when category changes
    if (!filteredSubcategories.find((s) => s.id === subcategoryId)) {
      setSubcategoryId("");
      setSubcategoryInput("");
    }
  }, [categoryId]);

  const handleSubcategorySelect = (sub: Subcategory) => {
    setSubcategoryId(sub.id);
    setSubcategoryInput(sub.name);
    setShowSubcategorySuggestions(false);
  };

  const handleCreateSubcategory = () => {
    if (!subcategoryInput.trim() || !categoryId || !onAddSubcategory) return;
    const newSub = onAddSubcategory({
      name: subcategoryInput.trim(),
      parentCategoryId: categoryId,
    });
    setSubcategoryId(newSub.id);
    setShowSubcategorySuggestions(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    
    // If there's a subcategory input but no ID, create it first
    let finalSubcategoryId = subcategoryId;
    if (subcategoryInput.trim() && !subcategoryId && categoryId && onAddSubcategory) {
      const newSub = onAddSubcategory({
        name: subcategoryInput.trim(),
        parentCategoryId: categoryId,
      });
      finalSubcategoryId = newSub.id;
    }
    
    onSave({ 
      name: name.trim(), 
      barcode: hasBarcode ? (barcode.trim() || undefined) : "N/A",
      categoryId: categoryId || undefined, 
      subcategoryId: finalSubcategoryId || undefined, 
      isWeighted, 
      isSolidified: true 
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{product ? "Edit Product" : "New Product"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Leite Mimosa 1L" />
            {errors?.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="hasBarcode" 
                checked={hasBarcode} 
                onCheckedChange={(checked) => {
                  setHasBarcode(checked === true);
                  if (!checked) setBarcode("");
                }}
              />
              <Label htmlFor="hasBarcode" className="cursor-pointer">Has EAN / Barcode</Label>
            </div>
            {hasBarcode && (
              <Input 
                id="barcode" 
                value={barcode} 
                onChange={(e) => setBarcode(e.target.value)} 
                placeholder="e.g., 5601234567890" 
              />
            )}
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Subcategory - only show when category is selected */}
          {categoryId && (
            <div className="space-y-2">
              <Label>Subcategory</Label>
              <div className="relative">
                <Input
                  ref={subcategoryInputRef}
                  value={subcategoryInput}
                  onChange={(e) => {
                    setSubcategoryInput(e.target.value);
                    setSubcategoryId(""); // Clear ID when typing
                    setShowSubcategorySuggestions(true);
                  }}
                  onFocus={() => setShowSubcategorySuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSubcategorySuggestions(false), 150)}
                  placeholder="Type or select subcategory..."
                />
                {showSubcategorySuggestions && (subcategorySuggestions.length > 0 || (subcategoryInput.trim() && !exactMatch)) && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                    {subcategorySuggestions.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors",
                          subcategoryId === sub.id && "bg-secondary"
                        )}
                        onMouseDown={() => handleSubcategorySelect(sub)}
                      >
                        {sub.name}
                      </button>
                    ))}
                    {subcategoryInput.trim() && !exactMatch && onAddSubcategory && (
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors border-t border-border flex items-center gap-2 text-primary"
                        onMouseDown={handleCreateSubcategory}
                      >
                        <Plus className="w-4 h-4" />
                        Create "{subcategoryInput.trim()}"
                      </button>
                    )}
                  </div>
                )}
              </div>
              <p className="text-caption text-muted-foreground">Type to search or create new</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pricing Type</Label>
              <p className="text-caption text-muted-foreground">How this product is sold</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={!isWeighted ? "font-medium" : "text-muted-foreground"}>Unit</span>
              <Switch checked={isWeighted} onCheckedChange={setIsWeighted} />
              <span className={isWeighted ? "font-medium" : "text-muted-foreground"}>Weight</span>
            </div>
          </div>
        </div>
        <DialogFooter><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={handleSave}>{product ? "Save" : "Create"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
