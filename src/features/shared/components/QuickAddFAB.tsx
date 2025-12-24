import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export function QuickAddFAB() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on receipts page (it has its own add button)
  if (location.pathname === "/receipts" || location.pathname.startsWith("/receipts/")) {
    return null;
  }

  return (
    <Button
      size="lg"
      className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full shadow-lg touch-target-lg"
      onClick={() => navigate("/receipts?add=true")}
      aria-label="Quick add receipt"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
