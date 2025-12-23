import { ATCUDData } from "@/types/expense";

/**
 * Parses Portuguese ATCUD QR code data
 * Format typically contains fields like:
 * A:NIF*B:NIF_CLIENTE*C:PAIS*D:DOCTYPE*E:STATUS*F:DATA*G:ATCUD*H:NUMERO*I:TOTAIS*...
 */
export function parseATCUDQRCode(qrData: string): ATCUDData {
  const result: ATCUDData = {};
  
  // Split by * to get individual fields
  const fields = qrData.split("*");
  
  for (const field of fields) {
    const colonIndex = field.indexOf(":");
    if (colonIndex === -1) continue;
    
    const key = field.substring(0, colonIndex).toUpperCase();
    const value = field.substring(colonIndex + 1);
    
    switch (key) {
      case "A": // Merchant NIF
        result.nif = value;
        break;
      case "B": // Customer NIF (optional)
        if (value && value !== "999999990") {
          result.customerNif = value;
        }
        break;
      case "F": // Date (YYYYMMDD format)
        if (value.length >= 8) {
          const year = value.substring(0, 4);
          const month = value.substring(4, 6);
          const day = value.substring(6, 8);
          result.date = `${year}-${month}-${day}`;
          
          // Check if time is included (YYYYMMDDHHMMSS)
          if (value.length >= 14) {
            const hour = value.substring(8, 10);
            const minute = value.substring(10, 12);
            result.time = `${hour}:${minute}`;
          }
        }
        break;
      case "H": // Document number / Receipt number
        result.receiptNumber = value;
        break;
      case "I": // Total amounts (format varies, typically first value is total)
        // Format could be like "123.45" or "123.45;23.45" (gross;tax)
        const totalPart = value.split(";")[0];
        const parsedTotal = parseFloat(totalPart);
        if (!isNaN(parsedTotal)) {
          result.total = parsedTotal;
        }
        break;
      case "O": // Alternative total field in some formats
        if (!result.total) {
          const altTotal = parseFloat(value);
          if (!isNaN(altTotal)) {
            result.total = altTotal;
          }
        }
        break;
    }
  }
  
  return result;
}

/**
 * Validates if the QR code looks like a Portuguese ATCUD format
 */
export function isValidATCUDFormat(qrData: string): boolean {
  // Basic validation: should contain the merchant NIF field at minimum
  return qrData.includes("A:") && qrData.includes("*");
}
