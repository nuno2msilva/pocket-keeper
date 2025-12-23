import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ATCUDData } from "@/types/expense";
import { parseATCUDQRCode, isValidATCUDFormat } from "@/utils/atcudParser";
import { toast } from "sonner";

interface QRScannerProps {
  onScan: (data: ATCUDData) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanning = async () => {
    if (!containerRef.current) return;

    try {
      setError(null);
      setIsScanning(true);

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          if (isValidATCUDFormat(decodedText)) {
            const data = parseATCUDQRCode(decodedText);
            toast.success("QR code scanned successfully!");
            stopScanning();
            onScan(data);
          } else {
            toast.error("Invalid ATCUD format. Please scan a Portuguese receipt QR code.");
          }
        },
        () => {
          // Ignore scan failures (no QR found in frame)
        }
      );
    } catch (err) {
      console.error("Failed to start scanner:", err);
      setError("Could not access camera. Please ensure camera permissions are granted.");
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-title font-semibold">Scan Receipt QR Code</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div
          ref={containerRef}
          id="qr-reader"
          className="w-full max-w-sm aspect-square bg-secondary rounded-xl overflow-hidden"
        />

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3 w-full max-w-sm">
          {!isScanning ? (
            <Button onClick={startScanning} className="w-full" size="lg">
              <Camera className="w-5 h-5 mr-2" />
              Start Camera
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="secondary" className="w-full" size="lg">
              <RefreshCw className="w-5 h-5 mr-2" />
              Restart Camera
            </Button>
          )}
        </div>

        <p className="mt-6 text-caption text-muted-foreground text-center max-w-xs">
          Point your camera at the QR code on your Portuguese receipt to automatically extract the details.
        </p>
      </div>
    </div>
  );
}
