import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Category } from "@/features/shared/types";
import { useCategories } from "@/features/shared/hooks/useRepository";
import { DeleteConfirmDialog } from "@/features/shared/components/DeleteConfirmDialog";
import { toast } from "sonner";

export function CategoryEditor() {
  const { categories, updateCategory, deleteCategory, addCategory } = useCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📁");
  const [newColor, setNewColor] = useState("hsl(220, 70%, 50%)");

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditIcon(category.icon);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditIcon("");
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    updateCategory(editingId, { 
      name: editName.trim(), 
      icon: editIcon || "📁"
    });
    toast.success("Category updated");
    cancelEdit();
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteCategory(deleteId);
    toast.success("Category deleted");
    setDeleteId(null);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCategory({
      name: newName.trim(),
      icon: newIcon || "📁",
      color: newColor,
      isDefault: false,
    });
    toast.success("Category added");
    setNewName("");
    setNewIcon("📁");
    setIsAdding(false);
  };

  const categoryToDelete = categories.find(c => c.id === deleteId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-xl">🏷️</span>
          Categories
        </CardTitle>
        <CardDescription>
          Edit category names, emojis, or remove categories. All categories are fully customizable.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
          >
            {editingId === category.id ? (
              <>
                <Input
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value)}
                  className="w-14 text-center text-lg"
                  placeholder="🔸"
                  maxLength={2}
                />
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1"
                  placeholder="Category name"
                />
                <Button size="icon" variant="ghost" onClick={saveEdit}>
                  <Check className="w-4 h-4 text-success" />
                </Button>
                <Button size="icon" variant="ghost" onClick={cancelEdit}>
                  <X className="w-4 h-4 text-muted-foreground" />
                </Button>
              </>
            ) : (
              <>
                <span className="text-xl w-8 text-center">{category.icon}</span>
                <span className="flex-1 font-medium">{category.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => startEdit(category)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDeleteId(category.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </>
            )}
          </div>
        ))}

        {isAdding ? (
          <div className="flex items-center gap-2 p-2 rounded-lg border border-dashed border-primary">
            <Input
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              className="w-14 text-center text-lg"
              placeholder="📁"
              maxLength={2}
            />
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1"
              placeholder="New category name"
              autoFocus
            />
            <Button size="icon" variant="ghost" onClick={handleAdd}>
              <Check className="w-4 h-4 text-success" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setIsAdding(false)}>
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => setIsAdding(true)}
          >
            + Add Category
          </Button>
        )}

        <DeleteConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={confirmDelete}
          title="Delete Category?"
          description={`This will permanently delete "${categoryToDelete?.name}". Products in this category will become uncategorized.`}
          confirmText="Delete"
        />
      </CardContent>
    </Card>
  );
}
