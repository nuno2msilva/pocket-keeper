import { useState, useMemo } from "react";
import { Plus, Store } from "lucide-react";
import {
  AppLayout,
  PageHeader,
  EmptyState,
  DeleteConfirmDialog,
  ListCard,
  ListToolbar,
  useMerchants,
  useReceipts,
  Merchant,
  SortOption,
  FilterOption,
} from "@/features/shared";
import { Button } from "@/components/ui/button";
import { MerchantDialog } from "../components/MerchantDialog";
import { toast } from "sonner";

const SORT_OPTIONS: SortOption[] = [
  { id: "name", label: "Name" },
  { id: "spent", label: "Total Spent" },
  { id: "receipts", label: "Receipt Count" },
  { id: "review", label: "Needs Review" },
];

const FILTER_OPTIONS: FilterOption[] = [
  { id: "needs-review", label: "Needs Review", group: "Status" },
  { id: "has-nif", label: "Has NIF", group: "Details" },
  { id: "no-nif", label: "Missing NIF", group: "Details" },
];

export default function MerchantsPage() {
  const { merchants, addMerchant, updateMerchant, deleteMerchant } = useMerchants();
  const { receipts } = useReceipts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  // Filter & sort state
  const [search, setSearch] = useState("");
  const [currentSort, setCurrentSort] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const getReceiptCount = (merchantId: string) =>
    receipts.filter((r) => r.merchantId === merchantId).length;

  const getTotalSpent = (merchantId: string) =>
    receipts.filter((r) => r.merchantId === merchantId).reduce((sum, r) => sum + r.total, 0);

  // Filter and sort merchants
  const filteredMerchants = useMemo(() => {
    let result = [...merchants];

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.nif?.includes(query) ||
          m.address?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (activeFilters.length > 0) {
      result = result.filter((merchant) => {
        return activeFilters.some((filter) => {
          if (filter === "needs-review") return !merchant.isSolidified;
          if (filter === "has-nif") return !!merchant.nif;
          if (filter === "no-nif") return !merchant.nif;
          return true;
        });
      });
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (currentSort) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "spent":
          comparison = getTotalSpent(a.id) - getTotalSpent(b.id);
          break;
        case "receipts":
          comparison = getReceiptCount(a.id) - getReceiptCount(b.id);
          break;
        case "review":
          comparison = (a.isSolidified ? 1 : 0) - (b.isSolidified ? 1 : 0);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [merchants, search, activeFilters, currentSort, sortDirection, receipts]);

  const handleAdd = () => {
    setSelectedMerchant(null);
    setDialogOpen(true);
  };

  const handleEdit = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setDialogOpen(true);
  };

  const handleDelete = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setDeleteDialogOpen(true);
  };

  const handleSave = (data: Omit<Merchant, "id">) => {
    if (selectedMerchant) {
      updateMerchant(selectedMerchant.id, { ...data, isSolidified: true });
      toast.success("Store updated");
    } else {
      addMerchant({ ...data, isSolidified: true });
      toast.success("Store created");
    }
  };

  const confirmDelete = () => {
    if (selectedMerchant) {
      deleteMerchant(selectedMerchant.id);
      toast.success("Store deleted");
      setDeleteDialogOpen(false);
    }
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
        title="Stores"
        subtitle={`${merchants.length} saved`}
        action={
          <Button size="icon" variant="default" onClick={handleAdd} aria-label="Add store">
            <Plus className="w-5 h-5" />
          </Button>
        }
      />

      <ListToolbar
        searchPlaceholder="Search stores..."
        searchValue={search}
        onSearchChange={setSearch}
        sortOptions={SORT_OPTIONS}
        currentSort={currentSort}
        onSortChange={setCurrentSort}
        sortDirection={sortDirection}
        onSortDirectionChange={() => setSortDirection((d) => (d === "asc" ? "desc" : "asc"))}
        filterOptions={FILTER_OPTIONS}
        activeFilters={activeFilters}
        onFilterChange={toggleFilter}
        onClearFilters={() => setActiveFilters([])}
      />

      <div className="p-4 space-y-3">
        {merchants.length === 0 ? (
          <EmptyState
            icon={<Store className="w-8 h-8 text-muted-foreground" />}
            title="No stores yet"
            description="Stores are created automatically when you add receipts"
            actionLabel="Add Store"
            onAction={handleAdd}
          />
        ) : filteredMerchants.length === 0 ? (
          <EmptyState
            icon={<Store className="w-8 h-8 text-muted-foreground" />}
            title="No matches"
            description="Try adjusting your search or filters"
          />
        ) : (
          filteredMerchants.map((merchant) => {
            const receiptCount = getReceiptCount(merchant.id);
            const totalSpent = getTotalSpent(merchant.id);
            const needsReview = !merchant.isSolidified;

            return (
              <ListCard
                key={merchant.id}
                icon="🏪"
                title={merchant.name}
                badge={needsReview ? { label: "Review", variant: "warning" } : undefined}
                subtitle={merchant.nif ? `NIF: ${merchant.nif}` : undefined}
                meta={merchant.address}
                value={`€${totalSpent.toFixed(2)}`}
                valueSecondary={`${receiptCount} receipt${receiptCount !== 1 ? "s" : ""}`}
                onEdit={() => handleEdit(merchant)}
                onDelete={() => handleDelete(merchant)}
              />
            );
          })
        )}
      </div>

      <MerchantDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        merchant={selectedMerchant}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Store"
        description={`Are you sure you want to delete "${selectedMerchant?.name}"? Receipts linked to this store will remain.`}
        onConfirm={confirmDelete}
      />
    </AppLayout>
  );
}
