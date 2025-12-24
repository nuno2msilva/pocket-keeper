import { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlobalSearch } from "./GlobalSearch";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  backTo?: string;
}

export function PageHeader({ title, subtitle, action, backTo }: PageHeaderProps) {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between h-16 px-4 gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {backTo && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(backTo)}
                className="shrink-0"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-subheading font-semibold text-foreground truncate">{title}</h1>
              {subtitle && (
                <p className="text-caption text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Button>
            <ThemeToggle />
            {action}
          </div>
        </div>
      </header>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
