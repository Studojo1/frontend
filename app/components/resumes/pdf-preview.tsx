/**
 * PDF Preview Component - Live PDF Streaming for Editing/Review
 * 
 * This component ONLY handles PDF streaming. No image fallbacks.
 * PDFs are streamed directly from the server and displayed in an iframe.
 * Used for editing and review screens where fidelity is critical.
 */
import { useState } from "react";
import { FiDownload, FiZoomIn, FiZoomOut, FiRefreshCw } from "react-icons/fi";

interface PDFPreviewProps {
  previewUrl: string | null; // Must be a PDF URL
  loading: boolean;
  templateId: string;
  onGeneratePreview?: () => void;
}

export function PDFPreview({ previewUrl, loading, templateId, onGeneratePreview }: PDFPreviewProps) {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleDownload = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <FiRefreshCw className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-sm text-gray-600">Generating preview...</p>
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <p className="text-sm text-gray-600 mb-4">Preview will appear here</p>
        {onGeneratePreview && (
          <button
            onClick={onGeneratePreview}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
          >
            Generate Preview
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Preview Controls */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="p-1.5 text-gray-600 hover:text-gray-900 disabled:text-gray-300 rounded hover:bg-gray-100"
          >
            <FiZoomOut className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="p-1.5 text-gray-600 hover:text-gray-900 disabled:text-gray-300 rounded hover:bg-gray-100"
          >
            <FiZoomIn className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"
        >
          <FiDownload className="h-4 w-4" />
          Download
        </button>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto p-4">
        <div
          className="mx-auto bg-white shadow-lg"
          style={{
            width: `${(8.5 * zoom) / 100}in`,
            minHeight: `${(11 * zoom) / 100}in`,
          }}
        >
          <iframe
            src={previewUrl}
            className="w-full border-0"
            style={{
              height: `${(11 * zoom) / 100}in`,
            }}
            title="Resume Preview"
          />
        </div>
      </div>
    </div>
  );
}

