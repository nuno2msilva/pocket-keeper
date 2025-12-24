import { useState, useMemo } from "react";
import { Search, X, Receipt, Store, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useReceipts, useMerchants, useProducts } from "@/features/shared/hooks/useRepository";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  type: "receipt" | "merchant" | "product";
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  path: string;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { receipts } = useReceipts();
  const { merchants } = useMerchants();
  const { products } = useProducts();

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search receipts
    receipts.forEach((receipt) => {
      const merchant = merchants.find((m) => m.id === receipt.merchantId);
      const matchesMerchant = merchant?.name.toLowerCase().includes(q);
      const matchesNotes = receipt.notes?.toLowerCase().includes(q);
      const matchesNumber = receipt.receiptNumber?.toLowerCase().includes(q);

      if (matchesMerchant || matchesNotes || matchesNumber) {
        results.push({
          type: "receipt",
          id: receipt.id,
          title: merchant?.name || "Unknown",
          subtitle: `€${receipt.total.toFixed(2)} • ${new Date(receipt.date).toLocaleDateString()}`,
          icon: <Receipt className="w-4 h-4" />,
          path: `/receipts/${receipt.id}`,
        });
      }
    });

    // Search merchants
    merchants.forEach((merchant) => {
      if (merchant.name.toLowerCase().includes(q)) {
        results.push({
          type: "merchant",
          id: merchant.id,
          title: merchant.name,
          subtitle: merchant.address || "Merchant",
          icon: <Store className="w-4 h-4" />,
          path: `/merchants`,
        });
      }
    });

    // Search products
    products.forEach((product) => {
      if (product.name.toLowerCase().includes(q)) {
        results.push({
          type: "product",
          id: product.id,
          title: product.name,
          subtitle: product.defaultPrice ? `€${product.defaultPrice.toFixed(2)}` : "Product",
          icon: <Package className="w-4 h-4" />,
          path: `/products`,
        });
      }
    });

    return results.slice(0, 20);
  }, [query, receipts, merchants, products]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Everywhere
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search receipts, merchants, products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {query && results.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No results found
              </p>
            )}
            {results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleSelect(result)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {result.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{result.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {result.subtitle}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground capitalize">
                  {result.type}
                </span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
