"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Loader2,
  Calendar,
  Users,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ImportModal } from "@/components/ImportModal";
import { DocumentListItem } from "@/types";
import { UploadCloud } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [ownedDocs, setOwnedDocs] = useState<DocumentListItem[]>([]);
  const [sharedDocs, setSharedDocs] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
        alert("Failed to create document");
      }
    } catch (err) {
      console.error("Failed to create document:", err);
      alert("Error creating document");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Navbar with Persona Switcher */}
      <Navbar activeTab="documents" />

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
                  <p className="text-sm text-secondary mb-3">You haven't created any documents yet.</p>
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
                    <Link
                      key={doc.id}
                      href={`/documents/${doc.id}`}
                      className="group bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 hover:border-primary/40 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[160px]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-medium">
                            Owner
                          </span>
                          <ExternalLink className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                          {doc.title}
                        </h3>
                      </div>

                      <div className="text-xs text-on-surface-variant flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20">
                        <span>Updated {new Date(doc.updatedAt).toLocaleDateString()}</span>
                        <span>{doc.sharesCount ? `${doc.sharesCount} shared` : "Private"}</span>
                      </div>
                    </Link>
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
                    <Link
                      key={doc.id}
                      href={`/documents/${doc.id}`}
                      className="group bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 hover:border-primary/40 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[160px]"
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
                          <ExternalLink className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                          {doc.title}
                        </h3>
                      </div>

                      <div className="text-xs text-on-surface-variant flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20">
                        <span>By {doc.owner.name}</span>
                        <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Import File Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => fetchDocuments()}
      />
    </div>
  );
}
