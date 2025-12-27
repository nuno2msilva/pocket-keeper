import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Store, Calendar, Scale, Package, Pencil, Barcode } from "lucide-react";
import { ProductDialog } from "../components/ProductDialog";
import {
  AppLayout,
  useProducts,
  useCategories,
  useSubcategories,
  useMerchants,
} from "@/features/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { products, getPricesByMerchant, updateProduct } = useProducts();
  const { categories } = useCategories();
  const { subcategories, addSubcategory } = useSubcategories();
  const { merchants } = useMerchants();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const product = products.find((p) => p.id === id);
  const category = product?.categoryId ? categories.find((c) => c.id === product.categoryId) : undefined;
  const subcategory = product?.subcategoryId ? subcategories.find((s) => s.id === product.subcategoryId) : undefined;

  // Get prices by merchant
  const pricesByMerchant = useMemo(() => {
    if (!id) return [];
    const priceMap = getPricesByMerchant(id);
    return Array.from(priceMap.entries())
      .map(([merchantId, entry]) => ({
        merchant: merchants.find((m) => m.id === merchantId),
        ...entry,
      }))
      .filter((p) => p.merchant)
      .sort((a, b) => a.price - b.price); // Sort by price ascending
  }, [id, getPricesByMerchant, merchants]);

  // Calculate stats
  const cheapestPrice = pricesByMerchant[0]?.price;
  const expensivePrice = pricesByMerchant[pricesByMerchant.length - 1]?.price;
  const priceRange = expensivePrice && cheapestPrice ? expensivePrice - cheapestPrice : 0;

  // Get price history for trend
  const priceHistory = product?.priceHistory || [];
  const latestPrice = priceHistory[0]?.price;
  const previousPrice = priceHistory[1]?.price;
  const priceTrend = latestPrice && previousPrice 
    ? latestPrice > previousPrice ? "up" : latestPrice < previousPrice ? "down" : "stable"
    : "stable";
  const priceChange = latestPrice && previousPrice ? ((latestPrice - previousPrice) / previousPrice * 100) : 0;

  if (!product) {
    return (
      <AppLayout>
        <div className="p-4">
          <Button variant="ghost" onClick={() => navigate("/products")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Product not found</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{category?.icon || "📦"}</span>
              <h1 className="text-xl font-bold">{product.name}</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {category?.name || "Uncategorized"}
              {subcategory && ` › ${subcategory.name}`}
            </p>
            {product.barcode && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Barcode className="w-3 h-3" />
                {product.barcode}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setEditDialogOpen(true)}>
            <Pencil className="w-4 h-4" />
          </Button>
        </div>

        {/* Current Price Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    €{(product.defaultPrice ?? 0).toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">
                    {product.isWeighted ? "/kg" : "/un"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {product.isWeighted ? (
                  <Badge variant="secondary" className="gap-1">
                    <Scale className="w-3 h-3" />
                    Weight
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <Package className="w-3 h-3" />
                    Unit
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Price Trend */}
            {priceHistory.length > 1 && (
              <div className={cn(
                "mt-4 flex items-center gap-2 text-sm",
                priceTrend === "up" && "text-destructive",
                priceTrend === "down" && "text-green-600 dark:text-green-400",
                priceTrend === "stable" && "text-muted-foreground"
              )}>
                {priceTrend === "up" && <TrendingUp className="w-4 h-4" />}
                {priceTrend === "down" && <TrendingDown className="w-4 h-4" />}
                {priceTrend === "stable" && <Minus className="w-4 h-4" />}
                <span>
                  {priceTrend === "up" && `+${priceChange.toFixed(1)}% from last purchase`}
                  {priceTrend === "down" && `${priceChange.toFixed(1)}% from last purchase`}
                  {priceTrend === "stable" && "No price change"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Price Comparison by Store */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="w-4 h-4" />
              Price by Store
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pricesByMerchant.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No purchase history yet. Add this product to a receipt to start tracking prices.
              </p>
            ) : (
              <div className="space-y-3">
                {pricesByMerchant.map((entry, index) => {
                  const isCheapest = index === 0 && pricesByMerchant.length > 1;
                  const savings = cheapestPrice ? entry.price - cheapestPrice : 0;
                  
                  return (
                    <div
                      key={entry.merchantId}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        isCheapest ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800" : "bg-secondary"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                          isCheapest ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" : "bg-muted"
                        )}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{entry.merchant?.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(entry.date).toLocaleDateString("pt-PT", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-bold",
                          isCheapest && "text-green-700 dark:text-green-300"
                        )}>
                          €{entry.price.toFixed(2)}
                        </p>
                        {isCheapest && (
                          <Badge variant="outline" className="text-xs border-green-300 text-green-700 dark:border-green-700 dark:text-green-300">
                            Cheapest
                          </Badge>
                        )}
                        {!isCheapest && savings > 0 && (
                          <p className="text-xs text-muted-foreground">
                            +€{savings.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {priceRange > 0 && (
                  <div className="pt-2 border-t border-border text-sm text-muted-foreground text-center">
                    Price varies by <span className="font-medium text-foreground">€{priceRange.toFixed(2)}</span> across stores
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Price History */}
        {priceHistory.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Price History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {priceHistory.slice(0, 10).map((entry, index) => {
                  const merchant = merchants.find((m) => m.id === entry.merchantId);
                  const prevEntry = priceHistory[index + 1];
                  const change = prevEntry ? entry.price - prevEntry.price : 0;
                  
                  return (
                    <div
                      key={`${entry.date}-${entry.merchantId}`}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(entry.date).toLocaleDateString("pt-PT", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">{merchant?.name || "Unknown"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">€{entry.price.toFixed(2)}</p>
                        {change !== 0 && (
                          <p className={cn(
                            "text-xs",
                            change > 0 ? "text-destructive" : "text-green-600 dark:text-green-400"
                          )}>
                            {change > 0 ? "+" : ""}€{change.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <ProductDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          product={product}
          categories={categories}
          subcategories={subcategories}
          onSave={(updates) => {
            updateProduct(product.id, updates);
          }}
          onAddSubcategory={addSubcategory}
        />
      </div>
    </AppLayout>
  );
}
