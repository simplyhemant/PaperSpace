"use client";

import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
} from "lucide-react";

interface ToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
}

export function Toolbar({ editor, disabled }: ToolbarProps) {
  if (!editor || disabled) {
    return null;
  }

  return (
    <div className="sticky top-28 z-30 mb-6 max-w-[820px] w-full bg-surface-container-lowest/95 backdrop-blur-md shadow-md border border-outline-variant/30 rounded-xl px-3 py-2 flex items-center gap-1 flex-wrap">
      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
          editor.isActive("heading", { level: 1 })
            ? "bg-primary-fixed text-primary font-bold"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
        }`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
          editor.isActive("heading", { level: 2 })
            ? "bg-primary-fixed text-primary font-bold"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
        }`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
          editor.isActive("heading", { level: 3 })
            ? "bg-primary-fixed text-primary font-bold"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
        }`}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-surface-container-high mx-1" />

      {/* Inline Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
          editor.isActive("bold")
            ? "bg-primary-fixed text-primary font-bold"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
          editor.isActive("italic")
            ? "bg-primary-fixed text-primary font-bold"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
          editor.isActive("underline")
            ? "bg-primary-fixed text-primary font-bold"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
        }`}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-surface-container-high mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
          editor.isActive("bulletList")
            ? "bg-primary-fixed text-primary font-bold"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
        }`}
        title="Bulleted List"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
          editor.isActive("orderedList")
            ? "bg-primary-fixed text-primary font-bold"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
        }`}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
          editor.isActive("blockquote")
            ? "bg-primary-fixed text-primary font-bold"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
        }`}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
          editor.isActive("codeBlock")
            ? "bg-primary-fixed text-primary font-bold"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
        }`}
        title="Code Block"
      >
        <Code className="w-4 h-4" />
      </button>

      {/* Undo / Redo */}
      <div className="flex items-center gap-1 ml-auto">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
