import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";

type RenameResumeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onRename: (newName: string) => Promise<void>;
};

export function RenameResumeModal({
  isOpen,
  onClose,
  currentName,
  onRename,
}: RenameResumeModalProps) {
  const [newName, setNewName] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local state when currentName changes
  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, currentName]);

  const handleSave = async () => {
    const trimmedName = newName.trim();
    
    if (!trimmedName) {
      return;
    }

    if (trimmedName.length > 200) {
      return;
    }

    if (trimmedName === currentName) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      await onRename(trimmedName);
      onClose();
    } catch (error) {
      // Error handling is done in parent component
      console.error("Rename error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

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
                <h2 className="font-['Clash_Display'] text-2xl font-medium leading-8 tracking-tight text-neutral-950">
                  Rename Resume
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
                  disabled={isSaving}
                >
                  <FiX className="h-5 w-5 text-neutral-950" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="mb-2 block font-['Satoshi'] text-xs font-medium uppercase leading-4 tracking-tight text-gray-600">
                      Resume Name
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isSaving}
                      maxLength={200}
                      className="w-full rounded-lg bg-white px-3 py-2 font-['Satoshi'] text-sm font-normal text-neutral-950 outline outline-1 outline-gray-200 outline-offset-[-1px] placeholder:text-neutral-950/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="Enter resume name"
                    />
                    <p className="mt-1 font-['Satoshi'] text-xs font-normal leading-4 text-gray-500">
                      {newName.trim().length}/200 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-3 border-t-2 border-black px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="flex h-11 items-center justify-center rounded-xl border-2 border-gray-200 bg-white px-6 font-['Satoshi'] text-sm font-medium leading-5 text-neutral-950 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !newName.trim() || newName.trim() === currentName}
                  className="flex h-11 items-center justify-center rounded-xl bg-emerald-500 px-6 font-['Satoshi'] text-sm font-medium leading-5 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] outline outline-2 outline-offset-[-2px] outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

