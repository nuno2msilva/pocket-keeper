import { ReactNode } from "react";
import { Pencil, Trash2, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SwipeableItem } from "./SwipeableItem";

interface ListCardProps {
  /** Icon/emoji or element to show on the left */
  icon: ReactNode;
  /** Background color for the icon container */
  iconBg?: string;
  /** Main title text */
  title: string;
  /** Optional badge to show next to title */
  badge?: {
    label: string;
    variant: "warning" | "success" | "default";
  };
  /** Primary subtitle line */
  subtitle?: string;
  /** Secondary subtitle line (smaller) */
  meta?: string;
  /** Right side value display */
  value?: string;
  /** Secondary value below main value */
  valueSecondary?: string;
  /** Show edit button */
  onEdit?: () => void;
  /** Show delete button */
  onDelete?: () => void;
  /** Make entire card clickable */
  onClick?: () => void;
  /** Show chevron (for navigable items) */
  showChevron?: boolean;
  /** Enable swipe gestures for edit/delete */
  swipeable?: boolean;
  /** Additional class names */
  className?: string;
}

export function ListCard({
  icon,
  iconBg,
  title,
  badge,
  subtitle,
  meta,
  value,
  valueSecondary,
  onEdit,
  onDelete,
  onClick,
  showChevron,
  swipeable = true,
  className,
}: ListCardProps) {
  const hasActions = onEdit || onDelete;
  const isClickable = !!onClick;
  const canSwipe = swipeable && hasActions;

  const content = (
    <>
      {/* Top row: icon, name/meta, actions */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
          style={{ backgroundColor: iconBg || "hsl(var(--secondary))" }}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground truncate max-w-[160px] sm:max-w-none">
              {title}
            </h3>
            {badge && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs px-1.5 py-0",
                  badge.variant === "warning" && "text-warning border-warning/50",
                  badge.variant === "success" && "text-success border-success/50",
                  badge.variant === "default" && "text-muted-foreground"
                )}
              >
                {badge.variant === "warning" && <AlertCircle className="w-3 h-3 mr-1" />}
                {badge.label}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
          {meta && (
            <p className="text-[11px] text-muted-foreground">{meta}</p>
          )}
        </div>

        {/* Only show button actions if not swipeable */}
        {hasActions && !canSwipe && (
          <div className="flex gap-0.5 shrink-0">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                aria-label="Edit"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {showChevron && (
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </div>

      {/* Bottom row: stats (only if we have value) */}
      {(value || valueSecondary) && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            {valueSecondary}
          </p>
          <p className="text-sm font-semibold text-foreground">
            {value}
          </p>
        </div>
      )}
    </>
  );

  const cardContent = isClickable ? (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 bg-card rounded-lg border border-border",
        "hover:border-primary/30 hover:shadow-sm transition-all duration-200",
        className
      )}
    >
      {content}
    </button>
  ) : (
    <div
      className={cn(
        "p-4 bg-card rounded-lg border border-border",
        "hover:border-primary/30 hover:shadow-sm transition-all duration-200",
        className
      )}
    >
      {content}
    </div>
  );

  if (canSwipe) {
    return (
      <SwipeableItem
        onEdit={onEdit}
        onDelete={onDelete}
        className="rounded-lg"
      >
        {cardContent}
      </SwipeableItem>
    );
  }

  return cardContent;
}
