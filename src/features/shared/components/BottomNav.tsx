/**
 * BottomNav Component
 * 
 * Fixed navigation bar at the bottom of the screen.
 * Shows icons and labels for main app sections.
 * 
 * Features:
 * - Always visible at bottom of screen
 * - Active page is highlighted
 * - Touch-friendly button sizes
 * - Works on all screen sizes
 */

import { Home, Receipt, Store, Package, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

// Define all navigation items with their routes and icons
const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/receipts", icon: Receipt, label: "Receipts" },
  { to: "/merchants", icon: Store, label: "Stores" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* 
        Navigation container
        - Centered on larger screens
        - Full width on mobile
      */}
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto lg:max-w-2xl">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                // Base styles for all nav items
                "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg",
                "transition-all duration-200",
                "min-w-[64px] min-h-[48px]", // Minimum touch target size
                // Active vs inactive styles
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )
            }
            aria-label={label}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            <span className="text-[11px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
