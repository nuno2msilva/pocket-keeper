import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Receipt as ReceiptIcon, Check } from "lucide-react";
import {
  AppLayout,
  PageHeader,
  EmptyState,
  ListCard,
  ListToolbar,
  useReceipts,
  useMerchants,
  useProducts,
  Receipt,
  SortOption,
  FilterOption,
} from "@/features/shared";
import { Button } from "@/components/ui/button";
import { ReceiptDialog } from "../components/ReceiptDialog";
import { toast } from "sonner";

const SORT_OPTIONS: SortOption[] = [
  { id: "date", label: "Date" },
  { id: "total", label: "Total" },
  { id: "store", label: "Store Name" },
  { id: "items", label: "Item Count" },
];

export default function ReceiptsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { receipts, addReceipt, updateReceipt } = useReceipts();
  const { merchants, getOrCreateMerchant, searchMerchants } = useMerchants();
  const { products, getOrCreateProduct, findProductByBarcode } = useProducts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Filter & sort state
  const [search, setSearch] = useState("");
  const [currentSort, setCurrentSort] = useState("date");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Handle quick add from FAB
  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setSelectedReceipt(null);
      setDialogOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const getMerchant = (merchantId: string) => merchants.find((m) => m.id === merchantId);

  // Build filter options from merchants + status filters
  const filterOptions: FilterOption[] = useMemo(() => {
    const merchantFilters = merchants
      .slice(0, 10) // Limit to top 10 merchants
      .map((m) => ({
        id: `merchant:${m.id}`,
        label: m.name,
        group: "Store",
      }));

    return [
      { id: "has-nif", label: "Has NIF", group: "Status" },
      { id: "this-month", label: "This Month", group: "Date" },
      { id: "last-month", label: "Last Month", group: "Date" },
      ...merchantFilters,
    ];
  }, [merchants]);

  // Calculate this month's total
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const thisMonthTotal = receipts
    .filter((r) => {
      const date = new Date(r.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, r) => sum + r.total, 0);

  // Filter and sort receipts
  const filteredReceipts = useMemo(() => {
    let result = [...receipts];

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      result = result.filter((r) => {
        const merchant = getMerchant(r.merchantId);
        return (
          merchant?.name.toLowerCase().includes(query) ||
          r.receiptNumber?.toLowerCase().includes(query) ||
          r.notes?.toLowerCase().includes(query)
        );
      });
    }

    // Apply filters
    if (activeFilters.length > 0) {
      result = result.filter((receipt) => {
        return activeFilters.some((filter) => {
          if (filter === "has-nif") return receipt.hasCustomerNif;
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
          if (filter.startsWith("merchant:")) {
            return receipt.merchantId === filter.replace("merchant:", "");
          }
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
        case "store":
          const storeA = getMerchant(a.merchantId)?.name || "";
          const storeB = getMerchant(b.merchantId)?.name || "";
          comparison = storeA.localeCompare(storeB);
          break;
        case "items":
          comparison = a.items.length - b.items.length;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [receipts, search, activeFilters, currentSort, sortDirection, merchants, currentMonth, currentYear]);

  const handleAdd = () => {
    setSelectedReceipt(null);
    setDialogOpen(true);
  };

  const handleSave = (data: Omit<Receipt, "id">) => {
    if (selectedReceipt) {
      updateReceipt(selectedReceipt.id, data);
      toast.success("Receipt updated");
    } else {
      addReceipt(data);
      toast.success("Receipt created");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "short",
    });
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  return (
    <AppLayout>
      <PageHeader
        title="Receipts"
        subtitle={`€${thisMonthTotal.toFixed(2)} this month`}
        action={
          <Button size="icon" variant="default" onClick={handleAdd} aria-label="Add receipt">
            <Plus className="w-5 h-5" />
          </Button>
        }
      />

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

      <div className="p-4 space-y-3">
        {receipts.length === 0 ? (
          <EmptyState
            icon={<ReceiptIcon className="w-8 h-8 text-muted-foreground" />}
            title="No receipts yet"
            description="Start tracking your expenses by adding your first receipt"
            actionLabel="Add Receipt"
            onAction={handleAdd}
          />
        ) : filteredReceipts.length === 0 ? (
          <EmptyState
            icon={<ReceiptIcon className="w-8 h-8 text-muted-foreground" />}
            title="No matches"
            description="Try adjusting your search or filters"
          />
        ) : (
          filteredReceipts.map((receipt) => {
            const merchant = getMerchant(receipt.merchantId);
            const isNewMerchant = merchant && !merchant.isSolidified;

            return (
              <ListCard
                key={receipt.id}
                icon="🧾"
                title={merchant?.name || "Unknown Store"}
                badge={isNewMerchant ? { label: "New", variant: "warning" } : undefined}
                subtitle={`${formatDate(receipt.date)} • ${receipt.items.length} item${receipt.items.length !== 1 ? "s" : ""}`}
                meta={receipt.hasCustomerNif ? "✓ NIF" : undefined}
                value={`€${receipt.total.toFixed(2)}`}
                onClick={() => navigate(`/receipts/${receipt.id}`)}
                showChevron
              />
            );
          })
        )}
      </div>

      <ReceiptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        receipt={selectedReceipt}
        merchants={merchants}
        products={products}
        onSave={handleSave}
        onGetOrCreateProduct={getOrCreateProduct}
        onGetOrCreateMerchant={getOrCreateMerchant}
        onSearchMerchants={searchMerchants}
        onFindProductByBarcode={findProductByBarcode}
      />
    </AppLayout>
  );
}
