import { useState, useRef } from "react";
import { Download, Upload, RotateCcw, CheckCircle2, AlertCircle, Eye, MousePointer2 } from "lucide-react";
import { AppLayout, PageHeader } from "@/features/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { exportAllData, importData } from "@/features/shared/data/repository";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/features/shared/components/DeleteConfirmDialog";
import { useAccessibility } from "@/features/shared/hooks/useAccessibility";

export default function SettingsPage() {
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { highContrast, largerTargets, toggleHighContrast, toggleLargerTargets } = useAccessibility();

  const handleExport = () => {
    try {
      const data = exportAllData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `expense-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = importData(text);
      
      if (result.success) {
        setImportStatus("success");
        toast.success("Data imported successfully. Refresh to see changes.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setImportStatus("error");
        toast.error(result.error || "Import failed");
      }
    } catch (error) {
      setImportStatus("error");
      toast.error("Failed to read file");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleResetData = () => {
    localStorage.clear();
    toast.success("All data cleared. Refreshing...");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Settings"
        subtitle="Manage your data"
      />

      <div className="p-4 space-y-4">
        {/* Accessibility Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Accessibility
            </CardTitle>
            <CardDescription>
              Adjust display settings for better visibility and usability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="high-contrast" className="text-base">High Contrast</Label>
                <p className="text-sm text-muted-foreground">Increase color contrast for better visibility</p>
              </div>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={toggleHighContrast}
                className="touch-target"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="larger-targets" className="text-base">Larger Touch Targets</Label>
                <p className="text-sm text-muted-foreground">Increase button and control sizes</p>
              </div>
              <Switch
                id="larger-targets"
                checked={largerTargets}
                onCheckedChange={toggleLargerTargets}
                className="touch-target"
              />
            </div>
          </CardContent>
        </Card>

        {/* Export Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Export Data
            </CardTitle>
            <CardDescription>
              Download all your data as a JSON backup file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} className="w-full touch-target-lg">
              <Download className="w-4 h-4 mr-2" />
              Download Backup
            </Button>
          </CardContent>
        </Card>

        {/* Import Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Import Data
            </CardTitle>
            <CardDescription>
              Restore data from a previously exported backup file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button onClick={handleImportClick} variant="outline" className="w-full touch-target-lg">
              <Upload className="w-4 h-4 mr-2" />
              Select Backup File
            </Button>
            
            {importStatus === "success" && (
              <div className="flex items-center gap-2 text-success text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Import successful!
              </div>
            )}
            {importStatus === "error" && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                Import failed. Check your file format.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reset Card */}
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <RotateCcw className="w-5 h-5" />
              Reset All Data
            </CardTitle>
            <CardDescription>
              Clear all stored data and start fresh. This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setResetDialogOpen(true)} 
              variant="destructive"
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Everything
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="pt-4 text-center text-muted-foreground text-sm space-y-1">
          <p>Expense Tracker v1.0</p>
          <p>Data stored locally on your device</p>
        </div>
      </div>

      <DeleteConfirmDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        onConfirm={handleResetData}
        title="Reset All Data?"
        description="This will permanently delete all your receipts, products, merchants, and categories. This action cannot be undone."
        confirmText="Yes, Reset Everything"
      />
    </AppLayout>
  );
}
