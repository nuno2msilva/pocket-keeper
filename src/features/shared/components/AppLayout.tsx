/**
 * AppLayout Component
 * 
 * This is the main wrapper for all pages in the app.
 * It provides:
 * - Consistent background and spacing
 * - Bottom navigation (can be hidden)
 * - Responsive design that works on mobile, tablet, and desktop
 */

import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
  /** The page content to display */
  children: React.ReactNode;
  /** Set to true to hide the bottom navigation */
  hideNav?: boolean;
}

export function AppLayout({ children, hideNav }: AppLayoutProps) {
  return (
    // Full screen container with background color
    <div className="min-h-screen bg-background">
      {/* 
        Main content area
        - On mobile: full width with padding for nav
        - On tablet/desktop: centered with max width for readability
      */}
      <main 
        className={`
          ${hideNav ? "" : "pb-20"}
          lg:max-w-2xl lg:mx-auto lg:px-4
          xl:max-w-3xl
        `}
      >
        {children}
      </main>
      
      {/* Bottom navigation - only shown if hideNav is false */}
      {!hideNav && <BottomNav />}
    </div>
  );
}
