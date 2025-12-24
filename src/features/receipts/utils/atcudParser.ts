import { ATCUDData } from "@/features/shared";

/**
 * Parse Portuguese ATCUD QR codes from receipts
 * ATCUD format: A:NIF*B:NIF_CLIENTE*C:PAIS*D:TIPO*E:STATUS*F:DATA*G:IDENTIFICACAO*H:ATCUD*I1:*I2:*...N:TOTAL*O:IMPOSTOS*Q:HASH*R:CERT
 */
export function parseATCUDQRCode(qrData: string): ATCUDData {
  const result: ATCUDData = {};
  
  try {
    const parts = qrData.split("*");
    
    for (const part of parts) {
      const [key, value] = part.split(":");
      if (!key || value === undefined) continue;
      
      switch (key) {
        case "A": // Merchant NIF
          result.nif = value;
          break;
        case "B": // Customer NIF
          if (value && value !== "999999990") {
            result.customerNif = value;
          }
          break;
        case "F": // Date (YYYYMMDD format)
          if (value.length === 8) {
            result.date = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
          }
          break;
        case "G": // Receipt identification
          result.receiptNumber = value;
          break;
        case "H": // Time (HHMMSS format)
          if (value.length >= 4) {
            // Handle both HHMMSS and HHMM formats
            const hours = value.slice(0, 2);
            const minutes = value.slice(2, 4);
            result.time = `${hours}:${minutes}`;
          }
          break;
        case "N": // Total
          result.total = parseFloat(value);
          break;
      }
    }
  } catch (error) {
    console.error("Error parsing ATCUD QR code:", error);
  }
  
  return result;
}

export function isValidATCUDFormat(qrData: string): boolean {
  // Basic validation: should start with A: and contain asterisks
  return qrData.startsWith("A:") && qrData.includes("*");
}
