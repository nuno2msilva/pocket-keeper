import { ATCUDData } from "@/features/shared";

/**
 * Parse Portuguese ATCUD QR codes from receipts
 * ATCUD format: A:NIF*B:NIF_CLIENTE*C:PAIS*D:TIPO*E:STATUS*F:DATA*G:IDENTIFICACAO*H:ATCUD*I1:*I2:*...N:TOTAL*O:IMPOSTOS*Q:HASH*R:CERT
 */
export function parseATCUDQRCode(qrData: string): ATCUDData {
  const result: ATCUDData = {};

  const normalizeTime = (raw: string): string | undefined => {
    const value = raw.trim();

    // HH:MM or HH:MM:SS
    const colonMatch = value.match(/\b([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?\b/);
    if (colonMatch) return `${colonMatch[1]}:${colonMatch[2]}`;

    // HH.MM or HHhMM
    const dotMatch = value.match(/\b([01]\d|2[0-3])[\.h]([0-5]\d)\b/i);
    if (dotMatch) return `${dotMatch[1]}:${dotMatch[2]}`;

    // Compact HHMM or HHMMSS (digits only)
    if (/^\d{4}$/.test(value) || /^\d{6}$/.test(value)) {
      const hours = value.slice(0, 2);
      const minutes = value.slice(2, 4);
      if (/^(?:[01]\d|2[0-3])$/.test(hours) && /^(?:[0-5]\d)$/.test(minutes)) {
        return `${hours}:${minutes}`;
      }
    }

    // DateTime formats like ...T1345 or ...T134500
    const tMatch = value.match(/T([01]\d|2[0-3])([0-5]\d)([0-5]\d)?/);
    if (tMatch) return `${tMatch[1]}:${tMatch[2]}`;

    return undefined;
  };

  try {
    const parts = qrData.split("*");

    for (const part of parts) {
      const colonIndex = part.indexOf(":");
      if (colonIndex === -1) continue;

      const key = part.slice(0, colonIndex);
      const value = part.slice(colonIndex + 1);
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
          // Some issuers embed time in identification; try extracting it.
          if (!result.time) {
            const maybeTime = normalizeTime(value);
            if (maybeTime) result.time = maybeTime;
          }
          break;
        case "N": // Total
          result.total = parseFloat(value);
          break;
        default: {
          // Time isn't consistently keyed across issuers. If we haven't found it yet,
          // try to interpret any field value as a time.
          if (!result.time) {
            const maybeTime = normalizeTime(value);
            if (maybeTime) result.time = maybeTime;
          }
          break;
        }
      }
    }

    // Last-resort: extract time from the whole QR payload.
    if (!result.time) {
      const match = qrData.match(/\b([01]\d|2[0-3]):([0-5]\d)\b/);
      if (match) result.time = `${match[1]}:${match[2]}`;
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
