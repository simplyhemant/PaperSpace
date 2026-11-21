"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Loader2,
  UploadCloud,
  MoreVertical,
  Trash2,
  Edit3,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ImportModal } from "@/components/ImportModal";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { RenameModal } from "@/components/RenameModal";
import { DocumentListItem } from "@/types";

interface ToastState {
  message: string;
  type: "success" | "error";
}

export default function DashboardPage() {
  const router = useRouter();
  const [ownedDocs, setOwnedDocs] = useState<DocumentListItem[]>([]);
  const [sharedDocs, setSharedDocs] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Actions menu state
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);

  // Delete modal state
  const [docToDelete, setDocToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Rename modal state
  const [docToRename, setDocToRename] = useState<{ id: string; title: string } | null>(null);

  // Toast state
  const [toast, setToast] = useState<ToastState | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-actions-menu]")) {
        setActiveMenuDocId(null);
      }
    };
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setOwnedDocs(data.owned || []);
        setSharedDocs(data.shared || []);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Create new document
  const handleCreateDocument = async () => {
    try {
      setCreating(true);
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Document" }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/documents/${data.document.id}`);
      } else {
        setToast({ message: "Failed to create document.", type: "error" });
      }
    } catch (err) {
      console.error("Failed to create document:", err);
      setToast({ message: "Error creating document.", type: "error" });
    } finally {
      setCreating(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/documents/${docToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Immediately remove from dashboard without full reload
        setOwnedDocs((prev) => prev.filter((doc) => doc.id !== docToDelete.id));
        setToast({ message: "Document deleted successfully.", type: "success" });
        setDocToDelete(null);
      } else {
        const data = await res.json().catch(() => ({}));
        setToast({
          message: data.error || "Failed to delete document.",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      setToast({ message: "Network error while deleting document.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Rename Success
  const handleRenameSuccess = (newTitle: string) => {
    if (!docToRename) return;
    setOwnedDocs((prev) =>
      prev.map((doc) => (doc.id === docToRename.id ? { ...doc, title: newTitle } : doc))
    );
    setToast({ message: "Document renamed successfully.", type: "success" });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Navbar with Persona Switcher */}
      <Navbar activeTab="documents" />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              toast.type === "success"
                ? "bg-surface-container-lowest border-tertiary/40 text-on-surface"
                : "bg-surface-container-lowest border-error/40 text-error"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-error shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 text-secondary hover:text-on-surface"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-8">
        {/* Page Header & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">Documents</h1>
            <p className="text-sm text-secondary mt-1">
              Create, edit, and organize your collaborative rich-text documents.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-medium transition-colors shadow-xs"
            >
              <UploadCloud className="w-4 h-4 text-secondary" />
              <span>Import File</span>
            </button>

            <button
              type="button"
              onClick={handleCreateDocument}
              disabled={creating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>New Document</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-secondary mt-3">Loading documents...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* My Documents Section */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-on-surface">My Documents</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container font-semibold text-secondary">
                    {ownedDocs.length}
                  </span>
                </div>
              </div>

              {ownedDocs.length === 0 ? (
                <div className="w-full bg-surface-container-lowest p-8 rounded-xl border border-dashed border-outline-variant flex flex-col items-center justify-center text-center">
                  <p className="text-sm text-secondary mb-3">You haven&apos;t created any documents yet.</p>
                  <button
                    type="button"
                    onClick={handleCreateDocument}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container text-on-primary text-sm font-medium hover:bg-primary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create your first document</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {ownedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="group relative bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 hover:border-primary/40 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[160px]"
                    >
                      {/* Card Content (Click to open) */}
                      <Link
                        href={`/documents/${doc.id}`}
                        className="flex-1 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-medium">
                              Owner
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2 pr-6">
                            {doc.title}
                          </h3>
                        </div>

                        <div className="text-xs text-on-surface-variant flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20">
                          <span>Updated {new Date(doc.updatedAt).toLocaleDateString()}</span>
                          <span>{doc.sharesCount ? `${doc.sharesCount} shared` : "Private"}</span>
                        </div>
                      </Link>

                      {/* Three-Dot Actions Menu */}
                      <div className="absolute top-4 right-3" data-actions-menu>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveMenuDocId(activeMenuDocId === doc.id ? null : doc.id);
                          }}
                          className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
                          title="Document actions"
                          aria-label="Document actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuDocId === doc.id && (
                          <div
                            className="absolute right-0 top-full mt-1 w-36 bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-lg py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link
                              href={`/documents/${doc.id}`}
                              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container transition-colors"
                              onClick={() => setActiveMenuDocId(null)}
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-secondary" />
                              <span>Open</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuDocId(null);
                                setDocToRename({ id: doc.id, title: doc.title });
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container transition-colors text-left"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-secondary" />
                              <span>Rename</span>
                            </button>

                            <div className="my-1 border-t border-outline-variant/20" />

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuDocId(null);
                                setDocToDelete({ id: doc.id, title: doc.title });
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-error hover:bg-error/10 transition-colors text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-error" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Shared With Me Section */}
            {sharedDocs.length > 0 && (
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-on-surface">Shared With Me</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container font-semibold text-secondary">
                    {sharedDocs.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sharedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="group relative bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 hover:border-primary/40 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[160px]"
                    >
                      <Link
                        href={`/documents/${doc.id}`}
                        className="flex-1 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                doc.role === "EDITOR"
                                  ? "bg-secondary-fixed text-secondary"
                                  : "bg-surface-container-high text-on-surface-variant"
                              }`}
                            >
                              {doc.role === "EDITOR" ? "Editor" : "Viewer"}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2 pr-6">
                            {doc.title}
                          </h3>
                        </div>

                        <div className="text-xs text-on-surface-variant flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20">
                          <span>By {doc.owner.name}</span>
                          <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </Link>

                      {/* Three-Dot Actions Menu (Shared Docs: Open only, no Delete, no Rename) */}
                      <div className="absolute top-4 right-3" data-actions-menu>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveMenuDocId(activeMenuDocId === doc.id ? null : doc.id);
                          }}
                          className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
                          title="Document actions"
                          aria-label="Document actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuDocId === doc.id && (
                          <div
                            className="absolute right-0 top-full mt-1 w-28 bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-lg py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link
                              href={`/documents/${doc.id}`}
                              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container transition-colors"
                              onClick={() => setActiveMenuDocId(null)}
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-secondary" />
                              <span>Open</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={docToDelete !== null}
        documentTitle={docToDelete?.title || ""}
        isDeleting={isDeleting}
        onCancel={() => {
          if (!isDeleting) setDocToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      {/* Rename Document Modal */}
      <RenameModal
        isOpen={docToRename !== null}
        documentId={docToRename?.id || ""}
        currentTitle={docToRename?.title || ""}
        onClose={() => setDocToRename(null)}
        onRenamed={handleRenameSuccess}
      />

      {/* Import File Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => fetchDocuments()}
      />
    </div>
  );
}
