"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  ChevronDown,
  UserCheck,
  Check,
  ShieldCheck,
} from "lucide-react";
import { UserSummary } from "@/types";

interface NavbarProps {
  activeTab?: "documents" | "shared";
}

export function Navbar({ activeTab = "documents" }: NavbarProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [demoUsers, setDemoUsers] = useState<UserSummary[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch current user and available demo users
  useEffect(() => {
    async function loadAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.currentUser);
          setDemoUsers(data.demoUsers || []);
        }
      } catch (err) {
        console.error("Failed to load auth me:", err);
      }
    }
    loadAuth();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Switch demo persona
  const handleSwitchUser = async (userId: string) => {
    if (switching || userId === currentUser?.id) {
      setDropdownOpen(false);
      return;
    }

    try {
      setSwitching(true);
      const res = await fetch("/api/auth/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setDropdownOpen(false);
        router.refresh();
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to switch persona:", err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/40 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Logo & Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-105">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-on-surface tracking-tight">PaperSpace</span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-surface-container-high text-on-surface-variant font-medium">
              Internal Workspace
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "documents"
                  ? "bg-primary-container text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              Documents
            </Link>
          </nav>
        </div>

        {/* Right: Demo User Switcher Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-left"
              title="Click to switch demo persona"
            >
              <div className="w-7 h-7 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center overflow-hidden">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{currentUser?.name?.slice(0, 2).toUpperCase() || "US"}</span>
                )}
              </div>

              <div className="flex flex-col text-left pr-1">
                <span className="text-xs font-semibold text-on-surface leading-tight">
                  {currentUser?.name || "Loading..."}
                </span>
                <span className="text-[10px] text-secondary font-medium leading-none">
                  Switch Persona
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-on-surface-variant transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xl py-2 z-50">
                <div className="px-3.5 py-1.5 flex items-center justify-between border-b border-outline-variant/20 mb-1">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Switch Demo Persona
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                </div>

                <div className="flex flex-col gap-0.5 px-1">
                  {demoUsers.map((user) => {
                    const isSelected = user.id === currentUser?.id;
                    const roleLabel =
                      user.id.includes("owner") || user.id === "usr_alice_owner_001"
                        ? "Owner"
                        : user.id.includes("editor") || user.id === "usr_bob_editor_002"
                        ? "Editor"
                        : "Viewer";

                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSwitchUser(user.id)}
                        disabled={switching}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                          isSelected
                            ? "bg-surface-container font-medium"
                            : "hover:bg-surface-container-low"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs flex items-center justify-center shrink-0">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-on-surface truncate">
                              {user.name}
                            </p>
                            <p className="text-[11px] text-on-surface-variant truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              roleLabel === "Owner"
                                ? "bg-primary-fixed text-primary"
                                : roleLabel === "Editor"
                                ? "bg-secondary-fixed text-secondary"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            {roleLabel}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-tertiary" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
