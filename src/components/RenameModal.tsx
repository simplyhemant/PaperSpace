"use client";

import { useState, useEffect, useRef } from "react";
import { Edit3, Loader2 } from "lucide-react";

interface RenameModalProps {
  isOpen: boolean;
  documentId: string;
  currentTitle: string;
  onClose: () => void;
  onRenamed: (newTitle: string) => void;
}

export function RenameModal({
  isOpen,
  documentId,
  currentTitle,
  onClose,
  onRenamed,
}: RenameModalProps) {
  const [title, setTitle] = useState(currentTitle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
      setError(null);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, currentTitle]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Document title cannot be empty");
      return;
    }
    if (trimmed.length > 200) {
      setError("Title cannot exceed 200 characters");
      return;
    }
    if (trimmed === currentTitle) {
      onClose();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });

      if (res.ok) {
        onRenamed(trimmed);
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to rename document");
      }
    } catch (err) {
      setError("Network error while renaming document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/50 p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-on-surface">Rename Document</h3>
            <p className="text-xs text-secondary mt-0.5">Enter a new title for this document.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              placeholder="Document title"
              maxLength={200}
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-on-surface transition-all disabled:opacity-50"
            />
            {error && <p className="text-xs text-error mt-1.5">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary-container hover:bg-primary text-on-primary transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
