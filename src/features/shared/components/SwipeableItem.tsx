import { useState, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableItemProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function SwipeableItem({ children, onEdit, onDelete, className }: SwipeableItemProps) {
  const [offset, setOffset] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const ACTION_WIDTH = 80;
  const THRESHOLD = 40;

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (e.dir === "Left") {
        const newOffset = Math.min(Math.abs(e.deltaX), ACTION_WIDTH * 2);
        setOffset(-newOffset);
      } else if (e.dir === "Right" && isOpen) {
        const newOffset = Math.max(ACTION_WIDTH * 2 - Math.abs(e.deltaX), 0);
        setOffset(-newOffset);
      }
    },
    onSwipedLeft: (e) => {
      if (Math.abs(e.deltaX) > THRESHOLD) {
        setOffset(-ACTION_WIDTH * 2);
        setIsOpen(true);
      } else {
        setOffset(0);
        setIsOpen(false);
      }
    },
    onSwipedRight: () => {
      setOffset(0);
      setIsOpen(false);
    },
    trackMouse: false,
    trackTouch: true,
    preventScrollOnSwipe: true,
  });

  const handleEdit = () => {
    setOffset(0);
    setIsOpen(false);
    onEdit?.();
  };

  const handleDelete = () => {
    setOffset(0);
    setIsOpen(false);
    onDelete?.();
  };

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Action buttons */}
      <div className="absolute inset-y-0 right-0 flex">
        {onEdit && (
          <button
            onClick={handleEdit}
            className="w-20 flex items-center justify-center bg-primary text-primary-foreground"
            aria-label="Edit"
          >
            <Pencil className="w-5 h-5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            className="w-20 flex items-center justify-center bg-destructive text-destructive-foreground"
            aria-label="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main content */}
      <div
        {...handlers}
        style={{ transform: `translateX(${offset}px)` }}
        className="relative bg-card transition-transform duration-200 ease-out"
      >
        {children}
      </div>
    </div>
  );
}
