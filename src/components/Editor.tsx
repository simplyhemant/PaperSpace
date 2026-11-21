"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Toolbar } from "./Toolbar";

export type SaveStatus = "saved" | "saving" | "error" | "unsaved";

interface EditorProps {
  documentId: string;
  initialContent: any;
  isEditable: boolean;
  onSaveStatusChange?: (status: SaveStatus, lastSavedAt?: Date) => void;
}

export function Editor({
  documentId,
  initialContent,
  isEditable,
  onSaveStatusChange,
}: EditorProps) {
  const [mounted, setMounted] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef<boolean>(false);
  const pendingContentRef = useRef<any | null>(null);

  // Client mounting check to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const saveContent = useCallback(
    async (contentToSave: any) => {
      if (!isEditable) return;

      if (isSavingRef.current) {
        // Queue the latest content if a save is already in progress
        pendingContentRef.current = contentToSave;
        return;
      }

      try {
        isSavingRef.current = true;
        onSaveStatusChange?.("saving");

        const res = await fetch(`/api/documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: contentToSave }),
        });

        if (!res.ok) {
          throw new Error(`Failed to save: ${res.statusText}`);
        }

        onSaveStatusChange?.("saved", new Date());
      } catch (error) {
        console.error("Autosave failed:", error);
        onSaveStatusChange?.("error");
      } finally {
        isSavingRef.current = false;

        // If another change occurred while saving, dispatch it now
        if (pendingContentRef.current) {
          const next = pendingContentRef.current;
          pendingContentRef.current = null;
          saveContent(next);
        }
      }
    },
    [documentId, isEditable, onSaveStatusChange]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
    ],
    content: initialContent || {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    editable: isEditable,
    onUpdate: ({ editor }) => {
      if (!isEditable) return;

      onSaveStatusChange?.("unsaved");

      // Debounce autosave by 1000ms
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        const json = editor.getJSON();
        saveContent(json);
      }, 1000);
    },
  });

  // Clean up debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Update editor editable state if permissions change
  useEffect(() => {
    if (editor && editor.isEditable !== isEditable) {
      editor.setEditable(isEditable);
    }
  }, [editor, isEditable]);

  if (!mounted) {
    return (
      <div className="w-full flex flex-col items-center py-8">
        <div className="max-w-[820px] w-full min-h-[700px] bg-surface-container-lowest shadow-md rounded-xl p-8 sm:p-14 animate-pulse flex flex-col gap-4">
          <div className="h-8 bg-surface-container rounded-lg w-2/3" />
          <div className="h-4 bg-surface-container rounded w-full" />
          <div className="h-4 bg-surface-container rounded w-4/5" />
          <div className="h-4 bg-surface-container rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Floating Toolbar */}
      <Toolbar editor={editor} disabled={!isEditable} />

      {/* Realistic Paper Sheet Canvas */}
      <article className="max-w-[820px] w-full min-h-[900px] bg-surface-container-lowest shadow-md border border-outline-variant/30 rounded-xl p-8 sm:p-14 lg:p-16 text-on-surface focus:outline-none transition-shadow selection:bg-primary-fixed selection:text-primary">
        <EditorContent editor={editor} />
      </article>
    </div>
  );
}
