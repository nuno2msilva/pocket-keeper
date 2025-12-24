/**
 * App.tsx - Main Application Entry Point
 * 
 * This is the root component that sets up:
 * - Routing (navigation between pages)
 * - Global providers (tooltips, toasts, query client)
 * - Lazy loading for better performance
 */

import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

// Loading component shown while pages load
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

// ============================================================================
// LAZY LOADED PAGES
// Pages are loaded only when needed, making initial load faster
// ============================================================================

// Main pages
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const ReceiptsPage = lazy(() => import("@/features/receipts/pages/ReceiptsPage"));
const ReceiptDetail = lazy(() => import("@/features/receipts/pages/ReceiptDetail"));
const MerchantsPage = lazy(() => import("@/features/merchants/pages/MerchantsPage"));
const ProductsPage = lazy(() => import("@/features/products/pages/ProductsPage"));
const CategoriesPage = lazy(() => import("@/features/categories/pages/CategoriesPage"));
const CategoryDetailPage = lazy(() => import("@/features/categories/pages/CategoryDetailPage"));
const InsightsPage = lazy(() => import("@/features/insights/pages/InsightsPage"));
const SettingsPage = lazy(() => import("@/features/settings/pages/SettingsPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Query client for data fetching (future use with backend)
const queryClient = new QueryClient();

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Toast notifications */}
        <Toaster />
        <Sonner />
        
        {/* Router setup */}
        <BrowserRouter>
          {/* Suspense shows loader while lazy components load */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Dashboard (home) */}
              <Route path="/" element={<DashboardPage />} />
              
              {/* Receipts */}
              <Route path="/receipts" element={<ReceiptsPage />} />
              <Route path="/receipts/:id" element={<ReceiptDetail />} />
              
              {/* Data management pages */}
              <Route path="/merchants" element={<MerchantsPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/categories/:id" element={<CategoryDetailPage />} />
              
              {/* Analytics and settings */}
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* 404 fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
