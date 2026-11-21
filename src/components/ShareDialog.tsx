"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Trash2,
  Lock,
  Loader2,
  AlertCircle,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { DocumentShareDetail, UserSummary } from "@/types";

interface ShareDialogProps {
  documentId: string;
  documentTitle: string;
  owner: UserSummary;
  isOpen: boolean;
  onClose: () => void;
  onSharesUpdated?: () => void;
}

export function ShareDialog({
  documentId,
  documentTitle,
  owner,
  isOpen,
  onClose,
  onSharesUpdated,
}: ShareDialogProps) {
  const [shares, setShares] = useState<DocumentShareDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
  const [inviting, setInviting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch current shares
  const loadShares = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch(`/api/documents/${documentId}/shares`);
      if (res.ok) {
        const data = await res.json();
        setShares(data.shares || []);
      }
    } catch (err) {
      console.error("Failed to load shares:", err);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (isOpen) {
      loadShares();
    }
  }, [isOpen, loadShares]);

  if (!isOpen) return null;

  // Invite collaborator
  const handleInvite = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const email = emailInput.trim();
    if (!email) return;

    try {
      setInviting(true);
      setErrorMsg(null);

      const res = await fetch(`/api/documents/${documentId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: selectedRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to invite user");
        return;
      }

      setEmailInput("");
      loadShares();
      onSharesUpdated?.();
    } catch (err) {
      console.error("Invite error:", err);
      setErrorMsg("Error adding collaborator");
    } finally {
      setInviting(false);
    }
  };

  // Change collaborator role
  const handleUpdateRole = async (shareId: string, role: "EDITOR" | "VIEWER") => {
    try {
      const res = await fetch(`/api/documents/${documentId}/shares/${shareId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        loadShares();
        onSharesUpdated?.();
      }
    } catch (err) {
      console.error("Failed to update share role:", err);
    }
  };

  // Revoke collaborator access
  const handleRevokeShare = async (shareId: string) => {
    try {
      const res = await fetch(`/api/documents/${documentId}/shares/${shareId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadShares();
        onSharesUpdated?.();
      }
    } catch (err) {
      console.error("Failed to revoke share:", err);
    }
  };

  // Copy document link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-[580px] bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col border border-outline-variant/40">
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 border-b border-outline-variant/30">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0 mt-0.5">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-on-surface truncate">
                Share “{documentTitle}”
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Manage collaborators and server-side RBAC permissions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 flex flex-col gap-6">
          {/* Invite Section */}
          <form onSubmit={handleInvite} className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
              Invite Collaborator
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter email (e.g. bob@paperspace.internal)..."
                className="flex-1 px-3.5 py-2 text-sm bg-surface-container-low text-on-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
              />

              <div className="flex items-center gap-2">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as "EDITOR" | "VIEWER")}
                  className="px-3 py-2 bg-surface-container-low text-sm font-medium text-on-surface rounded-xl focus:outline-none border border-outline-variant/30 cursor-pointer"
                >
                  <option value="EDITOR">Editor</option>
                  <option value="VIEWER">Viewer</option>
                </select>

                <button
                  type="submit"
                  disabled={inviting || !emailInput.trim()}
                  className="px-4 py-2 bg-primary-container hover:bg-primary text-on-primary text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {inviting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>Invite</span>
                </button>
              </div>
            </div>

            {/* Quick Demo Recipient Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-[11px] text-secondary">Quick select:</span>
              <button
                type="button"
                onClick={() => setEmailInput("bob@paperspace.internal")}
                className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
              >
                Bob (bob@paperspace.internal)
              </button>
              <button
                type="button"
                onClick={() => setEmailInput("charlie@paperspace.internal")}
                className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
              >
                Charlie (charlie@paperspace.internal)
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-error-container text-error text-xs font-medium mt-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </form>

          {/* People with Access Section */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                People with access ({shares.length + 1})
              </span>
              <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Strict RBAC</span>
              </span>
            </div>

            <div className="flex flex-col divide-y divide-outline-variant/20 bg-surface-container-low/60 rounded-xl overflow-hidden border border-outline-variant/30">
              {/* Document Owner Row */}
              <div className="flex items-center justify-between p-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center shrink-0">
                    {owner.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-on-surface truncate">
                      {owner.name}
                    </p>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      {owner.email}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-primary text-xs font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Owner</span>
                </span>
              </div>

              {/* Collaborators List */}
              {loading ? (
                <div className="p-4 flex items-center justify-center gap-2 text-xs text-secondary">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Loading collaborators...</span>
                </div>
              ) : shares.length === 0 ? (
                <div className="p-4 text-center text-xs text-secondary">
                  No other collaborators yet. Invite someone above.
                </div>
              ) : (
                shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-3 gap-3 hover:bg-surface-container-lowest/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs flex items-center justify-center shrink-0">
                        {share.user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-on-surface truncate">
                          {share.user.name}
                        </p>
                        <p className="text-[11px] text-on-surface-variant truncate">
                          {share.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={share.role}
                        onChange={(e) =>
                          handleUpdateRole(share.id, e.target.value as "EDITOR" | "VIEWER")
                        }
                        className="px-2.5 py-1 bg-surface-container text-xs font-medium text-on-surface rounded-lg focus:outline-none cursor-pointer"
                      >
                        <option value="EDITOR">Editor</option>
                        <option value="VIEWER">Viewer</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRevokeShare(share.id)}
                        className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded-lg transition-colors"
                        title={`Remove ${share.user.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Copy Link Section */}
          <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-secondary" />
              <div className="text-xs">
                <p className="font-semibold text-on-surface">Document link</p>
                <p className="text-on-surface-variant text-[11px]">Direct access for invited collaborators</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-xs font-medium text-on-surface transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-tertiary" />
                  <span className="text-tertiary font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-primary" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-surface-container-low/70 border-t border-outline-variant/30 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-primary-container hover:bg-primary text-on-primary text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
