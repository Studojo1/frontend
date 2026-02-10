/**
 * PDF to PNG Conversion Utility
 * 
 * Converts PDF buffers to PNG images for template preview generation.
 * Uses pdfjs-dist for PDF parsing and canvas for rendering.
 * 
 * Note: Requires canvas library to be installed (npm install canvas)
 * and system dependencies (cairo, pango, etc.) on the server.
 * 
 * This module uses dynamic imports to avoid bundling issues with native modules.
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
  const {
    scale = 2.0,
    page = 1,
  } = options;

  try {
    // Use createRequire for native modules to avoid bundling issues
    // These modules are marked as external in vite.config but we use require() at runtime
    const { createRequire } = await import("module");
    const require = createRequire(import.meta.url);
    
    // @ts-ignore - canvas is a native module, not available at build time
    const { createCanvas } = require("canvas");
    
    // pdfjs-dist needs to be imported as ES module for Node.js
    // Use the legacy build which works in Node.js without workers
    const pdfjsModule = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const pdfjsLib = (pdfjsModule as any).default || pdfjsModule;

    // Ensure getDocument is available
    if (!pdfjsLib || typeof pdfjsLib.getDocument !== "function") {
      throw new Error(
        `pdfjs-dist getDocument not found. Module structure: ${Object.keys(pdfjsLib || {}).join(", ")}`
      );
    }

    // Load PDF document - pdfjs-dist expects Uint8Array, not Buffer
    // Ensure the buffer is valid
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("PDF buffer is empty or invalid");
    }
    
    const uint8Array = new Uint8Array(pdfBuffer);
    
    // Load the PDF with proper configuration for Node.js
    // Note: The legacy build doesn't require a worker
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useSystemFonts: true,
      verbosity: 0,
    });
    
    // Wait for the document to be fully loaded and parsed
    const pdfDocument = await loadingTask.promise;
    
    // Validate PDF has pages - access numPages to ensure document is ready
    const numPages = pdfDocument.numPages;
    if (!numPages || numPages === 0) {
      throw new Error(`PDF document has no pages`);
    }
    
    // pdfjs-dist uses 0-based indexing for pages
    // page parameter is 1-based (page 1 = first page), so convert to 0-based
    const pageIndex = page - 1;
    
    // Validate page index is within bounds
    if (pageIndex < 0 || pageIndex >= numPages) {
      throw new Error(
        `Page ${page} is out of range. PDF has ${numPages} page(s). Requested index: ${pageIndex}`
      );
    }
    
    // Get the page - use the page number directly (1-based) as some pdfjs-dist versions expect this
    // Try 0-based first, then 1-based if that fails
    let pdfPage;
    try {
      pdfPage = await pdfDocument.getPage(pageIndex);
    } catch (error: any) {
      // If 0-based fails, try 1-based (some versions of pdfjs-dist use 1-based)
      if (error.message?.includes("Invalid page request") || error.message?.includes("Invalid")) {
        try {
          pdfPage = await pdfDocument.getPage(page); // Try 1-based
        } catch (e2: any) {
          throw new Error(
            `Failed to get page ${page} (tried index ${pageIndex} and ${page}) from PDF with ${numPages} page(s). ` +
            `Error: ${error.message}`
          );
        }
      } else {
        throw error;
      }
    }
    
    // Calculate viewport with scale
    const viewport = pdfPage.getViewport({ scale });
    
    // Create canvas
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");
    
    // Render PDF page to canvas
    const renderContext = {
      canvasContext: context as any,
      viewport: viewport,
    };
    
    await pdfPage.render(renderContext).promise;
    
    // Convert canvas to PNG buffer
    const pngBuffer = canvas.toBuffer("image/png");
    
    return pngBuffer;
  } catch (error: any) {
    // If canvas/pdfjs-dist not available, throw helpful error
    if (error.message?.includes("Cannot find module") || error.code === "MODULE_NOT_FOUND") {
      throw new Error(
        "PDF to PNG conversion requires 'canvas' and 'pdfjs-dist' packages. " +
        "Install with: npm install canvas pdfjs-dist"
      );
    }
    throw new Error(`Failed to convert PDF to PNG: ${error.message}`);
  }
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
  const base64 = pngBuffer.toString("base64");
  return `data:image/png;base64,${base64}`;
}

