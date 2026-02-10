import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiAlertTriangle } from "react-icons/fi";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      button: "bg-red-500 hover:bg-red-600 text-white",
      icon: "text-red-500",
    },
    warning: {
      button: "bg-yellow-500 hover:bg-yellow-600 text-white",
      icon: "text-yellow-500",
    },
    info: {
      button: "bg-emerald-500 hover:bg-emerald-600 text-white",
      icon: "text-emerald-500",
    },
  };

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] outline outline-2 outline-offset-[-2px] outline-black"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-black px-6 py-4">
                <div className="flex items-center gap-3">
                  <FiAlertTriangle className={`h-6 w-6 ${styles.icon}`} />
                  <h2 className="font-['Clash_Display'] text-2xl font-medium leading-8 tracking-tight text-neutral-950">
                    {title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <FiX className="h-5 w-5 text-neutral-950" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="font-['Satoshi'] text-base text-gray-700 mb-6">
                  {message}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-4 py-2 font-['Satoshi'] text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {cancelText}
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`px-4 py-2 font-['Satoshi'] text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ${styles.button}`}
                  >
                    {isLoading ? "Processing..." : confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

