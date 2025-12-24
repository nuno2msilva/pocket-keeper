import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Product, Category, Subcategory } from "@/features/shared";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  categories: Category[];
  subcategories: Subcategory[];
  onSave: (product: Omit<Product, "id">) => void;
}

export function ProductDialog({ open, onOpenChange, product, categories, subcategories, onSave }: ProductDialogProps) {
  const [name, setName] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [isWeighted, setIsWeighted] = useState(false);
  const [excludeFromPriceHistory, setExcludeFromPriceHistory] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredSubcategories = categoryId ? subcategories.filter((s) => s.parentCategoryId === categoryId) : [];

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDefaultPrice(product.defaultPrice?.toString() || "");
      setCategoryId(product.categoryId || "");
      setSubcategoryId(product.subcategoryId || "");
      setIsWeighted(product.isWeighted || false);
      setExcludeFromPriceHistory(product.excludeFromPriceHistory || false);
    } else {
      setName("");
      setDefaultPrice("");
      setCategoryId("");
      setSubcategoryId("");
      setIsWeighted(false);
      setExcludeFromPriceHistory(false);
    }
    setErrors({});
  }, [product, open]);

  useEffect(() => {
    if (!filteredSubcategories.find((s) => s.id === subcategoryId)) setSubcategoryId("");
  }, [categoryId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ name: name.trim(), defaultPrice: defaultPrice ? parseFloat(defaultPrice) : undefined, categoryId: categoryId || undefined, subcategoryId: subcategoryId || undefined, isWeighted, excludeFromPriceHistory, isSolidified: true });
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
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Default Price (€{isWeighted ? "/kg" : "/unit"})</Label>
            <Input id="price" type="number" step="0.01" min="0" value={defaultPrice} onChange={(e) => setDefaultPrice(e.target.value)} placeholder={isWeighted ? "e.g., 5.99" : "e.g., 1.29"} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>))}</SelectContent></Select>
          </div>
          {filteredSubcategories.length > 0 && (
            <div className="space-y-2">
              <Label>Subcategory</Label>
              <Select value={subcategoryId} onValueChange={setSubcategoryId}><SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger><SelectContent>{filteredSubcategories.map((sub) => (<SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>))}</SelectContent></Select>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label>Pricing Type</Label>
            <div className="flex items-center gap-2 text-sm">
              <span className={!isWeighted ? "font-medium" : "text-muted-foreground"}>Unit</span>
              <Switch checked={isWeighted} onCheckedChange={setIsWeighted} />
              <span className={isWeighted ? "font-medium" : "text-muted-foreground"}>Weight</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5"><Label>Exclude from Price History</Label><p className="text-caption text-muted-foreground">For promo items</p></div>
            <Switch checked={excludeFromPriceHistory} onCheckedChange={setExcludeFromPriceHistory} />
          </div>
        </div>
        <DialogFooter><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={handleSave}>{product ? "Save" : "Create"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
