import Link from "next/link";
import { FileText, ArrowRight, ShieldCheck, Users, UploadCloud } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl bg-surface-container-lowest p-8 sm:p-12 rounded-2xl shadow-sm border border-outline-variant/40 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center mb-6 shadow-md">
          <FileText className="w-7 h-7" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-on-surface mb-3">
          PaperSpace
        </h1>
        <p className="text-base text-secondary max-w-lg mb-8 leading-relaxed">
          A lightweight, collaborative document workspace built for speed, clean rich-text formatting, and server-side RBAC permissions.
        </p>

        {currentUser && (
          <div className="mb-8 p-3 px-5 rounded-xl bg-surface-container flex items-center gap-3 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container animate-pulse" />
            <span className="text-on-surface-variant font-medium">Active Demo Session:</span>
            <span className="font-semibold text-on-surface">{currentUser.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-medium">
              {currentUser.email}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-medium shadow-sm transition-all text-sm"
          >
            <span>Enter Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-8 border-t border-outline-variant/30 text-left text-xs text-secondary">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-on-surface">Server-Side RBAC</p>
              <p className="mt-0.5 text-on-surface-variant">Owner, Editor, Viewer enforcement</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Users className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-on-surface">Demo Switcher</p>
              <p className="mt-0.5 text-on-surface-variant">Switch personas instantly in UI</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <UploadCloud className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-on-surface">File Import</p>
              <p className="mt-0.5 text-on-surface-variant">TXT and Markdown auto-conversion</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
