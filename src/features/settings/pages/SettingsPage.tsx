import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Download, Upload, Trash2, FileJson } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handleExportData = () => {
    try {
      const data = {
        receipts: JSON.parse(localStorage.getItem("expense-tracker-receipts") || "[]"),
        merchants: JSON.parse(localStorage.getItem("expense-tracker-merchants") || "[]"),
        products: JSON.parse(localStorage.getItem("expense-tracker-products") || "[]"),
        categories: JSON.parse(localStorage.getItem("expense-tracker-categories") || "[]"),
        subcategories: JSON.parse(localStorage.getItem("expense-tracker-subcategories") || "[]"),
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expense-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully!");
    } catch (error) {
      toast.error("Failed to export data");
      console.error(error);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (!data.receipts || !data.merchants || !data.products) {
          throw new Error("Invalid data format");
        }

        setShowImportDialog(true);

        // Store the data temporarily for confirmation
        (window as any).__importData = data;
      } catch (error) {
        toast.error("Invalid file format");
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    const data = (window as any).__importData;
    if (!data) return;

    localStorage.setItem("expense-tracker-receipts", JSON.stringify(data.receipts));
    localStorage.setItem("expense-tracker-merchants", JSON.stringify(data.merchants));
    localStorage.setItem("expense-tracker-products", JSON.stringify(data.products));
    localStorage.setItem("expense-tracker-categories", JSON.stringify(data.categories || []));
    localStorage.setItem("expense-tracker-subcategories", JSON.stringify(data.subcategories || []));

    delete (window as any).__importData;
    setShowImportDialog(false);
    toast.success("Data imported successfully!");
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleDeleteAllData = () => {
    // Delete everything from localStorage
    localStorage.clear();
    
    // Set flag to prevent demo data from loading
    localStorage.setItem("expense-tracker-demo-loaded-v2", "true");
    
    // Set empty arrays for all data
    localStorage.setItem("expense-tracker-receipts", JSON.stringify([]));
    localStorage.setItem("expense-tracker-merchants", JSON.stringify([]));
    localStorage.setItem("expense-tracker-products", JSON.stringify([]));
    localStorage.setItem("expense-tracker-categories", JSON.stringify([]));
    localStorage.setItem("expense-tracker-subcategories", JSON.stringify([]));
    
    toast.success("All data permanently deleted. Refreshing...");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Export, import, or delete your expense data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleExportData} variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <div className="flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  id="import-file"
                />
                <label htmlFor="import-file" className="w-full">
                  <Button asChild variant="outline" className="w-full">
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Data
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            <Alert variant="destructive">
              <AlertDescription>
                Danger Zone: Deleting all data is permanent and cannot be undone.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all your receipts,
              merchants, products, categories, and subcategories from your device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all your current data with the imported data. Do you want to
              continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>Import</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
