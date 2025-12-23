import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface ItemCardProps {
  icon: ReactNode;
  iconBg?: string;
  title: string;
  subtitle?: string;
  value?: string;
  onClick?: () => void;
}

export function ItemCard({ icon, iconBg, title, subtitle, value, onClick }: ItemCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 text-left animate-fade-in"
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: iconBg || 'hsl(var(--muted))' }}
      >
        {icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-body font-semibold text-foreground truncate">{title}</h3>
        {subtitle && (
          <p className="text-caption text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        {value && (
          <span className="text-body font-medium text-muted-foreground">{value}</span>
        )}
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </button>
  );
}
