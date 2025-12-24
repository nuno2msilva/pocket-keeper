import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Feature imports
import { ReceiptsPage, ReceiptDetail } from "@/features/receipts";
import MerchantsPage from "@/features/merchants/pages/MerchantsPage";
import ProductsPage from "@/features/products/pages/ProductsPage";
import CategoriesPage from "@/features/categories/pages/CategoriesPage";
import CategoryDetailPage from "@/features/categories/pages/CategoryDetailPage";
import InsightsPage from "@/features/insights/pages/InsightsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ReceiptsPage />} />
          <Route path="/receipts/:id" element={<ReceiptDetail />} />
          <Route path="/merchants" element={<MerchantsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:id" element={<CategoryDetailPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
