import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Category } from "@/types/expense";

const EMOJI_OPTIONS = ["🛒", "🍽️", "🚗", "🛍️", "💊", "💡", "🏠", "🎮", "📚", "✈️", "☕", "🎬", "💪", "🐕", "👔", "🎵"];
const COLOR_OPTIONS = [
  "hsl(152, 60%, 42%)",
  "hsl(15, 85%, 60%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 60%, 55%)",
  "hsl(174, 62%, 40%)",
  "hsl(220, 60%, 50%)",
  "hsl(340, 70%, 55%)",
  "hsl(200, 70%, 50%)",
];

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSave: (category: Omit<Category, "id">) => void;
}

export function CategoryDialog({ open, onOpenChange, category, onSave }: CategoryDialogProps) {
  const [name, setName] = useState(category?.name || "");
  const [icon, setIcon] = useState(category?.icon || EMOJI_OPTIONS[0]);
  const [color, setColor] = useState(category?.color || COLOR_OPTIONS[0]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon, color });
    onOpenChange(false);
    setName("");
    setIcon(EMOJI_OPTIONS[0]);
    setColor(COLOR_OPTIONS[0]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Groceries"
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-8 gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                    icon === emoji
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {category ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
