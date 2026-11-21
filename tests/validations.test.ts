import { describe, it, expect } from "vitest";
import {
  CreateDocumentSchema,
  RenameDocumentSchema,
  ShareDocumentSchema,
  SwitchUserSchema,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_EXTENSIONS,
} from "@/lib/validations";

describe("Input Validation Schemas (Zod)", () => {
  describe("CreateDocumentSchema", () => {
    it("accepts a valid document title and provides default content", () => {
      const result = CreateDocumentSchema.safeParse({ title: "New Document" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("New Document");
      }
    });

    it("trims whitespace from title", () => {
      const result = CreateDocumentSchema.safeParse({ title: "  Clean Title  " });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Clean Title");
      }
    });

    it("rejects an empty or whitespace-only title", () => {
      const result = CreateDocumentSchema.safeParse({ title: "   " });
      expect(result.success).toBe(false);
    });
  });

  describe("RenameDocumentSchema", () => {
    it("validates valid rename request", () => {
      const result = RenameDocumentSchema.safeParse({ title: "Renamed Title" });
      expect(result.success).toBe(true);
    });

    it("rejects empty title on rename", () => {
      const result = RenameDocumentSchema.safeParse({ title: "" });
      expect(result.success).toBe(false);
    });

    it("rejects title exceeding 200 characters", () => {
      const longTitle = "a".repeat(201);
      const result = RenameDocumentSchema.safeParse({ title: longTitle });
      expect(result.success).toBe(false);
    });
  });

  describe("ShareDocumentSchema", () => {
    it("accepts valid email and valid role", () => {
      const result = ShareDocumentSchema.safeParse({
        email: "bob@paperspace.internal",
        role: "EDITOR",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email formats", () => {
      const result = ShareDocumentSchema.safeParse({
        email: "not-an-email",
        role: "VIEWER",
      });
      expect(result.success).toBe(false);
    });

    it("rejects unsupported roles", () => {
      const result = ShareDocumentSchema.safeParse({
        email: "bob@paperspace.internal",
        role: "ADMIN",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("SwitchUserSchema", () => {
    it("accepts valid non-empty user IDs", () => {
      const result = SwitchUserSchema.safeParse({ userId: "usr_alice_owner_001" });
      expect(result.success).toBe(true);
    });

    it("rejects empty user ID", () => {
      const result = SwitchUserSchema.safeParse({ userId: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("File Import Constraints", () => {
    it("defines 2 MB maximum file upload size limit", () => {
      expect(MAX_FILE_SIZE_BYTES).toBe(2 * 1024 * 1024);
    });

    it("whitelists .txt, .md, and .markdown extensions", () => {
      expect(ALLOWED_EXTENSIONS).toContain(".txt");
      expect(ALLOWED_EXTENSIONS).toContain(".md");
      expect(ALLOWED_EXTENSIONS).toContain(".markdown");
      expect(ALLOWED_EXTENSIONS).not.toContain(".pdf");
      expect(ALLOWED_EXTENSIONS).not.toContain(".docx");
    });
  });
});
