import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { AppLayout, PageHeader, EmptyState, DeleteConfirmDialog, useCategories, useSubcategories, useProducts, Subcategory } from "@/features/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { categories } = useCategories();
  const { subcategories, addSubcategory, updateSubcategory, deleteSubcategory, getSubcategoriesByCategory, cleanupEmptySubcategories } = useSubcategories();
  const { products } = useProducts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [subcategoryName, setSubcategoryName] = useState("");

  const category = categories.find((c) => c.id === id);
  const categorySubcategories = id ? getSubcategoriesByCategory(id) : [];

  // Auto-cleanup empty subcategories on mount
  useEffect(() => {
    cleanupEmptySubcategories(products);
  }, []);

  const getProductCount = (subcategoryId: string) => products.filter((p) => p.subcategoryId === subcategoryId).length;

  const handleAddSubcategory = () => {
    setSelectedSubcategory(null);
    setSubcategoryName("");
    setDialogOpen(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setSubcategoryName(subcategory.name);
    setDialogOpen(true);
  };

  const handleDeleteSubcategory = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setDeleteDialogOpen(true);
  };

  const handleSaveSubcategory = () => {
    if (!subcategoryName.trim() || !id) return;
    if (selectedSubcategory) {
      updateSubcategory(selectedSubcategory.id, { name: subcategoryName.trim() });
      toast.success("Subcategory updated");
    } else {
      addSubcategory({ name: subcategoryName.trim(), parentCategoryId: id });
      toast.success("Subcategory created");
    }
    setDialogOpen(false);
  };

  const confirmDeleteSubcategory = () => {
    if (selectedSubcategory) {
      deleteSubcategory(selectedSubcategory.id);
      toast.success("Subcategory deleted");
      setDeleteDialogOpen(false);
    }
  };

  if (!category) {
    return (
      <AppLayout>
        <PageHeader title="Category not found" backTo="/categories" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={category.name}
        subtitle={`${categorySubcategories.length} subcategories`}
        backTo="/categories"
        action={<Button size="icon" variant="default" onClick={handleAddSubcategory} aria-label="Add subcategory"><Plus className="w-5 h-5" /></Button>}
      />

      <div className="p-4">
        <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: `${category.color}20` }}>{category.icon}</div>
          <div>
            <h2 className="font-semibold">{category.name}</h2>
            <p className="text-caption text-muted-foreground">{products.filter((p) => p.categoryId === category.id).length} total products</p>
          </div>
        </div>

        {categorySubcategories.length === 0 ? (
          <EmptyState icon={<Tag className="w-8 h-8 text-muted-foreground" />} title="No subcategories" description="Create subcategories for more granular organization" actionLabel="Add Subcategory" onAction={handleAddSubcategory} />
        ) : (
          <div className="space-y-2">
            {categorySubcategories.map((subcategory) => {
              const productCount = getProductCount(subcategory.id);
              return (
                <div key={subcategory.id} className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-all">
                  <Tag className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <h3 className="font-medium">{subcategory.name}</h3>
                    <p className="text-caption text-muted-foreground">{productCount} product{productCount !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleEditSubcategory(subcategory)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => handleDeleteSubcategory(subcategory)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{selectedSubcategory ? "Edit Subcategory" : "New Subcategory"}</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label htmlFor="subcategoryName">Name *</Label>
            <Input id="subcategoryName" value={subcategoryName} onChange={(e) => setSubcategoryName(e.target.value)} placeholder="e.g., Fruits, Dairy" className="mt-2" />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSubcategory} disabled={!subcategoryName.trim()}>{selectedSubcategory ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Delete Subcategory" description={`Delete "${selectedSubcategory?.name}"? Products will become uncategorized within this category.`} onConfirm={confirmDeleteSubcategory} />
    </AppLayout>
  );
}
