import { useState } from "react";
import { Pencil, Trash2, Check, X, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Category } from "@/features/shared/types";
import { useCategories } from "@/features/shared/hooks/useRepository";
import { DeleteConfirmDialog } from "@/features/shared/components/DeleteConfirmDialog";
import { toast } from "sonner";

// Preset colors for quick selection
const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#78716c", "#64748b", "#475569",
];

export function CategoryEditor() {
  const { categories, updateCategory, deleteCategory, addCategory } = useCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editColor, setEditColor] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📁");
  const [newColor, setNewColor] = useState("#3b82f6");

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditIcon(category.icon);
    setEditColor(category.color || "#3b82f6");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditIcon("");
    setEditColor("");
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    updateCategory(editingId, { 
      name: editName.trim(), 
      icon: editIcon || "📁",
      color: editColor || "#3b82f6"
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
      color: newColor || "#3b82f6",
      isDefault: false,
    });
    toast.success("Category added");
    setNewName("");
    setNewIcon("📁");
    setNewColor("#3b82f6");
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
          Edit category names, emojis, colors, or remove categories. All categories are fully customizable.
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="shrink-0"
                      style={{ backgroundColor: editColor }}
                    >
                      <Palette className="w-4 h-4" style={{ color: getContrastColor(editColor) }} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="end">
                    <div className="space-y-3">
                      <div className="grid grid-cols-5 gap-2">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className="w-7 h-7 rounded-md border-2 transition-transform hover:scale-110"
                            style={{ 
                              backgroundColor: color,
                              borderColor: editColor === color ? "hsl(var(--foreground))" : "transparent"
                            }}
                            onClick={() => setEditColor(color)}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          placeholder="#3b82f6"
                          className="flex-1 text-sm"
                          maxLength={7}
                        />
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="w-10 h-8 rounded cursor-pointer border border-border"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button size="icon" variant="ghost" onClick={saveEdit}>
                  <Check className="w-4 h-4 text-success" />
                </Button>
                <Button size="icon" variant="ghost" onClick={cancelEdit}>
                  <X className="w-4 h-4 text-muted-foreground" />
                </Button>
              </>
            ) : (
              <>
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  {category.icon}
                </div>
                <span className="flex-1 font-medium">{category.name}</span>
                <div 
                  className="w-4 h-4 rounded-full shrink-0 border border-border"
                  style={{ backgroundColor: category.color }}
                  title={category.color}
                />
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
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="shrink-0"
                  style={{ backgroundColor: newColor }}
                >
                  <Palette className="w-4 h-4" style={{ color: getContrastColor(newColor) }} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="end">
                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="w-7 h-7 rounded-md border-2 transition-transform hover:scale-110"
                        style={{ 
                          backgroundColor: color,
                          borderColor: newColor === color ? "hsl(var(--foreground))" : "transparent"
                        }}
                        onClick={() => setNewColor(color)}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1 text-sm"
                      maxLength={7}
                    />
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-10 h-8 rounded cursor-pointer border border-border"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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

// Helper function to determine text color for contrast
function getContrastColor(hexColor: string): string {
  // Default to white if invalid
  if (!hexColor || !hexColor.startsWith("#") || hexColor.length < 7) return "#ffffff";
  
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? "#000000" : "#ffffff";
}
