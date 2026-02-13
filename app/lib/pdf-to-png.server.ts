/**
 * PDF to PNG Conversion Utility
 * 
 * NOTE: This functionality has been disabled. Canvas and pdfjs-dist have been removed.
 * If you need PDF to PNG conversion, reinstall canvas and pdfjs-dist packages.
 */

export interface ConvertOptions {
  width?: number;
  height?: number;
  scale?: number; // Scale factor (default: 2.0 for high quality)
  page?: number; // Page number to convert (default: 1)
}

/**
 * Convert PDF buffer to PNG buffer
 * @param pdfBuffer - PDF file buffer
 * @param options - Conversion options
 * @returns PNG buffer
 */
export async function convertPdfToPng(
  pdfBuffer: Buffer,
  options: ConvertOptions = {}
): Promise<Buffer> {
  throw new Error(
    "PDF to PNG conversion is not available. Canvas and pdfjs-dist packages have been removed. " +
    "If you need this functionality, reinstall: npm install canvas pdfjs-dist"
  );
}

/**
 * Convert PDF buffer to PNG and return as base64 data URL
 * @param pdfBuffer - PDF file buffer
 * @param options - Conversion options
 * @returns Base64 data URL string
 */
export async function convertPdfToPngDataUrl(
  pdfBuffer: Buffer,
  options: ConvertOptions = {}
): Promise<string> {
  const pngBuffer = await convertPdfToPng(pdfBuffer, options);
  return `data:image/png;base64,${pngBuffer.toString("base64")}`;
}
