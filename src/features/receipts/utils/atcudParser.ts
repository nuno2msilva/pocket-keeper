import { ATCUDData } from "@/features/shared";

/**
 * Parse Portuguese ATCUD QR codes from receipts
 * 
 * ATCUD QR Format fields:
 * A: NIF do emitente (Merchant NIF)
 * B: NIF do adquirente (Customer NIF)
 * C: País (Country, e.g., PT)
 * D: Tipo de documento (Document type, e.g., FT = Fatura)
 * E: Estado do documento (Status)
 * F: Data de emissão (Issue date YYYYMMDD)
 * G: Identificação única do documento (Document ID / Receipt number)
 * H: ATCUD (Unique document code - NOT time!)
 * I1-I8: Tax breakdown fields
 * N: Base tributável / Tax base amount (NOT the receipt total!)
 * O: Total do documento (Document total including tax)
 * Q: 4 caracteres do Hash
 * R: Número do certificado
 * 
 * NOTE: Time is NOT included in ATCUD QR codes. It's printed on receipts
 * but not encoded in the QR. Users must enter time manually.
 */
export function parseATCUDQRCode(qrData: string): ATCUDData {
  const result: ATCUDData = {};

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
        case "B": // Customer NIF (999999990 = consumidor final / no NIF)
          if (value && value !== "999999990") {
            result.customerNif = value;
          }
          break;
        case "F": // Date (YYYYMMDD format)
          if (value.length === 8) {
            result.date = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
          }
          break;
        case "G": // Receipt identification (e.g., "FT 0090032025110001/001107")
          result.receiptNumber = value;
          break;
        // H is ATCUD code (e.g., "J6F32MXV-001107"), NOT time!
        case "O": // Total do documento (document total WITH tax - this is the real total)
          result.total = parseFloat(value);
          break;
        case "N": // Tax base - only use if O wasn't found (fallback for older formats)
          if (result.total === undefined) {
            result.total = parseFloat(value);
          }
          break;
      }
    }
  } catch (error) {
    console.error("Error parsing ATCUD QR code:", error);
  }

  // Note: Time is NOT available in ATCUD QR codes
  // result.time remains undefined - user must enter manually

  return result;
}

export function isValidATCUDFormat(qrData: string): boolean {
  // Basic validation: should start with A: and contain asterisks
  return qrData.startsWith("A:") && qrData.includes("*");
}
