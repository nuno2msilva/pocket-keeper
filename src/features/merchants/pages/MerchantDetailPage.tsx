import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Hash, Receipt, TrendingUp, Calendar, Pencil } from "lucide-react";
import { MerchantDialog } from "../components/MerchantDialog";
import {
  AppLayout,
  useMerchants,
  useReceipts,
  useCategories,
  SortOption,
  ListCard,
  ListToolbar,
  EmptyState,
} from "@/features/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SORT_OPTIONS: SortOption[] = [
  { id: "date", label: "Date" },
  { id: "total", label: "Total" },
  { id: "items", label: "Item Count" },
];

export default function MerchantDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { merchants, updateMerchant } = useMerchants();
  const { receipts } = useReceipts();
  const { categories } = useCategories();

  const [search, setSearch] = useState("");
  const [currentSort, setCurrentSort] = useState("date");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const merchant = merchants.find((m) => m.id === id);

  // Get receipts for this merchant
  const merchantReceipts = useMemo(() => {
    if (!id) return [];
    return receipts.filter((r) => r.merchantId === id);
  }, [id, receipts]);

  // Filter and sort receipts
  const filteredReceipts = useMemo(() => {
    let result = [...merchantReceipts];

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.receiptNumber?.toLowerCase().includes(query) ||
          r.notes?.toLowerCase().includes(query) ||
          r.items.some((i) => i.productName.toLowerCase().includes(query))
      );
    }

    // Apply date filters
    if (activeFilters.length > 0) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      result = result.filter((receipt) => {
        return activeFilters.some((filter) => {
          if (filter === "this-month") {
            const date = new Date(receipt.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          }
          if (filter === "last-month") {
            const date = new Date(receipt.date);
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
          }
          if (filter === "has-nif") return receipt.hasCustomerNif;
          return true;
        });
      });
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (currentSort) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "total":
          comparison = a.total - b.total;
          break;
        case "items":
          comparison = a.items.length - b.items.length;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [merchantReceipts, search, activeFilters, currentSort, sortDirection]);

  // Calculate stats
  const totalSpent = merchantReceipts.reduce((sum, r) => sum + r.total, 0);
  const averageReceipt = merchantReceipts.length > 0 ? totalSpent / merchantReceipts.length : 0;

  // Get spending by month for trend
  const monthlySpending = useMemo(() => {
    const months: Record<string, number> = {};
    merchantReceipts.forEach((r) => {
      const monthKey = r.date.substring(0, 7); // YYYY-MM
      months[monthKey] = (months[monthKey] || 0) + r.total;
    });
    return Object.entries(months).sort((a, b) => b[0].localeCompare(a[0]));
  }, [merchantReceipts]);

  const filterOptions = [
    { id: "this-month", label: "This Month", group: "Date" },
    { id: "last-month", label: "Last Month", group: "Date" },
    { id: "has-nif", label: "Has NIF", group: "Status" },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]
    );
  };

  if (!merchant) {
    return (
      <AppLayout>
        <div className="p-4">
          <Button variant="ghost" onClick={() => navigate("/merchants")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Store not found</p>
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/merchants")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏪</span>
              <h1 className="text-xl font-bold truncate">{merchant.name}</h1>
            </div>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
              {merchant.nif && (
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  NIF: {merchant.nif}
                </span>
              )}
              {merchant.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {merchant.address}
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setEditDialogOpen(true)}>
            <Pencil className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
              <p className="text-lg font-bold text-primary">€{totalSpent.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Receipts</p>
              <p className="text-lg font-bold">{merchantReceipts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Avg Receipt</p>
              <p className="text-lg font-bold">€{averageReceipt.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Spending Summary */}
        {monthlySpending.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Monthly Spending</span>
              </div>
              <div className="space-y-2">
                {monthlySpending.slice(0, 3).map(([month, total]) => {
                  const date = new Date(month + "-01");
                  const monthName = date.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
                  const percentage = totalSpent > 0 ? (total / totalSpent) * 100 : 0;
                  
                  return (
                    <div key={month} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-32 truncate capitalize">{monthName}</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-20 text-right">€{total.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Receipts List */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Receipts
          </h2>

          <ListToolbar
            searchPlaceholder="Search receipts..."
            searchValue={search}
            onSearchChange={setSearch}
            sortOptions={SORT_OPTIONS}
            currentSort={currentSort}
            onSortChange={setCurrentSort}
            sortDirection={sortDirection}
            onSortDirectionChange={() => setSortDirection((d) => (d === "asc" ? "desc" : "asc"))}
            filterOptions={filterOptions}
            activeFilters={activeFilters}
            onFilterChange={toggleFilter}
            onClearFilters={() => setActiveFilters([])}
          />

          <div className="space-y-3 mt-3">
            {merchantReceipts.length === 0 ? (
              <EmptyState
                icon={<Receipt className="w-8 h-8 text-muted-foreground" />}
                title="No receipts yet"
                description="Add a receipt from this store to start tracking"
              />
            ) : filteredReceipts.length === 0 ? (
              <EmptyState
                icon={<Receipt className="w-8 h-8 text-muted-foreground" />}
                title="No matches"
                description="Try adjusting your search or filters"
              />
            ) : (
              filteredReceipts.map((receipt) => (
                <ListCard
                  key={receipt.id}
                  icon="🧾"
                  title={formatDate(receipt.date)}
                  subtitle={`${receipt.items.length} item${receipt.items.length !== 1 ? "s" : ""}`}
                  meta={receipt.hasCustomerNif ? "✓ NIF" : undefined}
                  value={`€${receipt.total.toFixed(2)}`}
                  onClick={() => navigate(`/receipts/${receipt.id}`)}
                  showChevron
                />
              ))
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <MerchantDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          merchant={merchant}
          onSave={(updates) => {
            updateMerchant(merchant.id, updates);
          }}
        />
      </div>
    </AppLayout>
  );
}
