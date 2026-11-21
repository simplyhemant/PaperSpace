"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  CheckCircle,
  Loader2,
  AlertCircle,
  Share2,
  Eye,
  FileQuestion,
  FileText,
} from "lucide-react";
import { Editor, SaveStatus } from "@/components/Editor";
import { DocumentDetail } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DocumentPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [documentData, setDocumentData] = useState<DocumentDetail | null>(null);
  const [permissions, setPermissions] = useState<{
    role: "OWNER" | "EDITOR" | "VIEWER";
    canView: boolean;
    canEditContent: boolean;
    canRename: boolean;
    canDelete: boolean;
    canManageShares: boolean;
  } | null>(null);

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  // Fetch document details
  const fetchDocument = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/documents/${id}`);
      if (!res.ok) {
        setErrorStatus(res.status);
        return;
      }

      const data = await res.json();
      setDocumentData(data.document);
      setPermissions(data.document.permissions);
      setTitle(data.document.title);
      setLastSavedAt(new Date(data.document.updatedAt));
      setErrorStatus(null);
    } catch (err) {
      console.error("Error fetching document:", err);
      setErrorStatus(500);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  // Handle title rename
  const handleRename = async () => {
    if (!permissions?.canRename || !title.trim() || title === documentData?.title) {
      return;
    }

    try {
      setIsRenaming(true);
      const res = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setDocumentData((prev) => (prev ? { ...prev, title: data.document.title } : null));
        setLastSavedAt(new Date());
      }
    } catch (err) {
      console.error("Failed to rename document:", err);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleSaveStatusChange = (status: SaveStatus, savedDate?: Date) => {
    setSaveStatus(status);
    if (savedDate) {
      setLastSavedAt(savedDate);
    }
  };

  // Loading State
  if (loading) {
    return (
      <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-secondary font-medium">Loading document...</p>
        </div>
      </main>
    );
  }

  // 404 Not Found / Unauthorized State
  if (errorStatus === 404 || !documentData || !permissions) {
    return (
      <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/40 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-secondary mb-5">
            <FileQuestion className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface mb-2">Document Not Found</h1>
          <p className="text-sm text-secondary mb-6 leading-relaxed">
            This document does not exist or you do not have permission to access it.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-container text-on-primary hover:bg-primary text-sm font-medium transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Document Sub-Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/40 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
        {/* Left Section: Back Link & Document Title */}
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>

          <div className="h-5 w-px bg-surface-container-high shrink-0" />

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
                disabled={!permissions.canRename}
                className={`text-lg sm:text-xl font-semibold text-on-surface bg-transparent rounded px-1.5 -ml-1.5 truncate max-w-[240px] sm:max-w-md transition-colors ${
                  permissions.canRename
                    ? "hover:bg-surface-container focus:bg-surface-container focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-text"
                    : "cursor-default opacity-90 select-none"
                }`}
                title={permissions.canRename ? "Click to rename" : "Title locked for non-owners"}
              />

              {!permissions.canRename && (
                <span title="Title locked">
                  <Lock className="w-4 h-4 text-on-surface-variant shrink-0" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span>Owner: {documentData.owner.name}</span>
              <span>•</span>
              <span>
                {lastSavedAt ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "All changes saved"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Save Status, Role Badge, Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Save Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-xs font-medium text-on-surface">
            {saveStatus === "saving" && (
              <>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                <span>Saving...</span>
              </>
            )}

            {saveStatus === "saved" && (
              <>
                <span className="w-2 h-2 rounded-full bg-tertiary-container" />
                <CheckCircle className="w-3.5 h-3.5 text-tertiary" />
                <span>Saved</span>
              </>
            )}

            {saveStatus === "error" && (
              <>
                <span className="w-2 h-2 rounded-full bg-error" />
                <AlertCircle className="w-3.5 h-3.5 text-error" />
                <span className="text-error font-semibold">Save failed</span>
              </>
            )}

            {saveStatus === "unsaved" && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-600">Unsaved</span>
              </>
            )}
          </div>

          {/* Role Pill Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              permissions.role === "OWNER"
                ? "bg-primary-fixed text-primary"
                : permissions.role === "EDITOR"
                ? "bg-secondary-fixed text-secondary"
                : "bg-surface-container-high text-on-surface-variant"
            }`}
          >
            {permissions.role === "OWNER" ? "Owner" : permissions.role === "EDITOR" ? "Editor" : "Viewer"}
          </span>

          {/* Share Button (Owner only) */}
          {permissions.canManageShares && (
            <button
              type="button"
              onClick={() => {
                alert("Share modal will open in Milestone 3");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-container text-on-primary hover:bg-primary text-xs font-medium rounded-lg shadow-sm transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          )}
        </div>
      </header>

      {/* View-Only Alert Banner for Viewers */}
      {!permissions.canEditContent && (
        <div className="w-full bg-surface-container-high px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-on-surface font-medium">
            <Eye className="w-4 h-4 text-primary shrink-0" />
            <span>
              You have <strong>view-only</strong> access. Contact <strong>{documentData.owner.name}</strong> to request edit permissions.
            </span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-surface-container-lowest text-secondary font-medium">
            Read Only
          </span>
        </div>
      )}

      {/* Main Canvas Area */}
      <main className="w-full flex-1 bg-surface-container-low/60 py-8 px-4 flex flex-col items-center">
        <Editor
          documentId={documentData.id}
          initialContent={documentData.content}
          isEditable={permissions.canEditContent}
          onSaveStatusChange={handleSaveStatusChange}
        />
      </main>
    </div>
  );
}
