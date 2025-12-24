import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, FlashlightOff, Flashlight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ATCUDData } from "@/features/shared";
import { parseATCUDQRCode, isValidATCUDFormat } from "../utils/atcudParser";

interface QRScannerProps {
  onScan: (data: ATCUDData) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          if (isValidATCUDFormat(decodedText)) {
            const data = parseATCUDQRCode(decodedText);
            scanner.stop().then(() => {
              onScan(data);
            });
          }
        },
        () => {}
      )
      .then(() => {
        // Check for flash capability
        const state = scanner.getState();
        if (state) {
          setHasFlash(true);
        }
      })
      .catch((err) => {
        setError("Could not access camera. Please grant camera permissions.");
        console.error("QR Scanner error:", err);
      });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScan]);

  const toggleFlash = async () => {
    // Flash toggle not reliably supported - removed
    setFlashOn(!flashOn);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <header className="flex items-center justify-between p-4 bg-black/50">
        <h2 className="text-white text-lg font-semibold">Scan Receipt QR</h2>
        <div className="flex gap-2">
          {hasFlash && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFlash}
              className="text-white hover:bg-white/20"
              aria-label={flashOn ? "Turn off flash" : "Turn on flash"}
            >
              {flashOn ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
            aria-label="Close scanner"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </header>

      <div ref={containerRef} className="flex-1 flex items-center justify-center relative">
        <div id="qr-reader" className="w-full max-w-md" />
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
            <div className="text-center">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-white mb-4">{error}</p>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
      </div>

      <footer className="p-6 bg-black/50">
        <p className="text-white/70 text-center text-sm">
          Point your camera at the QR code on your Portuguese receipt
        </p>
      </footer>
    </div>
  );
}
