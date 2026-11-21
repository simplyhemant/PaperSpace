"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (documentId: string) => void;
}

type ModalState = "idle" | "ready" | "uploading" | "success" | "error";

export function ImportModal({
  isOpen,
  onClose,
  onImportSuccess,
}: ImportModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [modalState, setModalState] = useState<ModalState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdDocId, setCreatedDocId] = useState<string | null>(null);
  const [createdDocTitle, setCreatedDocTitle] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setSelectedFile(null);
    setModalState("idle");
    setErrorMessage(null);
    setCreatedDocId(null);
    setCreatedDocTitle("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const validateAndSelectFile = (file: File) => {
    // 1. Size check
    if (file.size > 2 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMessage(`File size (${sizeMB} MB) exceeds the 2 MB limit.`);
      setModalState("error");
      return;
    }

    // 2. Extension check
    const name = file.name.toLowerCase();
    if (!name.endsWith(".txt") && !name.endsWith(".md") && !name.endsWith(".markdown")) {
      const ext = name.includes(".") ? `.${name.split(".").pop()}` : "unknown";
      setErrorMessage(
        `File format "${ext}" is not supported. Please upload a plain text (.txt) or markdown (.md) file under 2 MB.`
      );
      setModalState("error");
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setModalState("ready");
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  // Perform upload
  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      setModalState("uploading");
      setErrorMessage(null);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Import failed. Please try again.");
        setModalState("error");
        return;
      }

      setCreatedDocId(data.document.id);
      setCreatedDocTitle(data.document.title);
      setModalState("success");
      onImportSuccess?.(data.document.id);
    } catch (err) {
      console.error("Import request error:", err);
      setErrorMessage("Network error occurred during import.");
      setModalState("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col border border-outline-variant/40">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between bg-surface-container-lowest border-b border-outline-variant/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0 mt-0.5">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Import Document</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Convert existing Markdown or text files into an editable PaperSpace document.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.markdown"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* STATE: IDLE */}
          {modalState === "idle" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`cursor-pointer rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all border-2 border-dashed ${
                isDragOver
                  ? "border-primary bg-primary-fixed/20 scale-[0.99]"
                  : "border-outline-variant/60 bg-surface-container-low hover:bg-surface-container"
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary mb-3 shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-on-surface mb-1">
                Drop your file here, or{" "}
                <span className="text-primary underline underline-offset-4 font-bold">
                  browse files
                </span>
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                Supported formats: <strong className="text-on-surface">.txt</strong>,{" "}
                <strong className="text-on-surface">.md</strong> · Maximum file size:{" "}
                <strong className="text-on-surface">2 MB</strong>
              </p>
            </div>
          )}

          {/* STATE: READY */}
          {modalState === "ready" && selectedFile && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-surface-container flex items-center justify-between gap-4 border border-outline-variant/30">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shrink-0 shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-on-surface truncate">
                        {selectedFile.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-medium shrink-0">
                        Ready
                      </span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Ready to convert
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetState}
                  className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low text-xs text-on-surface-variant flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-tertiary shrink-0" />
                <span>Format and size verified. Ready to create editable document.</span>
              </div>
            </div>
          )}

          {/* STATE: UPLOADING */}
          {modalState === "uploading" && (
            <div className="p-6 rounded-xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-on-surface">
                  Converting and saving document...
                </span>
                <span className="text-xs text-on-surface-variant mt-0.5">
                  Parsing markdown blocks and headings into structured TipTap AST.
                </span>
              </div>
            </div>
          )}

          {/* STATE: SUCCESS */}
          {modalState === "success" && (
            <div className="py-4 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center shadow-xs">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">Document Created!</h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  “<strong className="text-on-surface">{createdDocTitle}</strong>” has been converted and saved to your workspace.
                </p>
              </div>
            </div>
          )}

          {/* STATE: ERROR */}
          {modalState === "error" && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-error-container text-error flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5 text-xs">
                  <span className="font-bold">Import failed</span>
                  <p className="text-on-error-container leading-relaxed">{errorMessage}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={resetState}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Try a different file
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between">
          <span className="text-[11px] text-on-surface-variant">
            Supports .txt and .md (up to 2 MB)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-xs font-medium text-on-surface transition-colors shadow-xs"
            >
              {modalState === "success" ? "Close" : "Cancel"}
            </button>

            {modalState === "ready" && (
              <button
                type="button"
                onClick={handleImport}
                className="px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span>Import Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {modalState === "success" && createdDocId && (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  router.push(`/documents/${createdDocId}`);
                }}
                className="px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span>Open in Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
