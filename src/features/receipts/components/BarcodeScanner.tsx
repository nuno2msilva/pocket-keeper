import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Barcode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode("barcode-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 120 },
        },
        (decodedText) => {
          // Stop and return barcode
          scanner.stop().then(() => {
            onScan(decodedText);
          });
        },
        () => {}
      )
      .catch((err) => {
        setError("Could not access camera. Please grant camera permissions.");
        console.error("Barcode Scanner error:", err);
      });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <header className="flex items-center justify-between p-4 bg-black/50">
        <h2 className="text-white text-lg font-semibold">Scan Product Barcode</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
          aria-label="Close scanner"
        >
          <X className="w-6 h-6" />
        </Button>
      </header>

      <div className="flex-1 flex items-center justify-center relative">
        <div id="barcode-reader" className="w-full max-w-md" />
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
            <div className="text-center">
              <Barcode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-white mb-4">{error}</p>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
      </div>

      <footer className="p-6 bg-black/50">
        <p className="text-white/70 text-center text-sm">
          Point your camera at a product barcode
        </p>
      </footer>
    </div>
  );
}
