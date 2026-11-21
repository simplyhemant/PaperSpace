import { z } from "zod";

// Create Document Schema
export const CreateDocumentSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").max(200, "Title is too long").default("Untitled Document"),
  content: z.any().optional(),
});

// Update Document Content Schema
export const UpdateDocumentContentSchema = z.object({
  content: z.any(),
});

// Rename Document Schema
export const RenameDocumentSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").max(200, "Title is too long"),
});

// Share Document Schema
export const ShareDocumentSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(["EDITOR", "VIEWER"]),
});

// Update Share Role Schema
export const UpdateShareRoleSchema = z.object({
  role: z.enum(["EDITOR", "VIEWER"]),
});

// Switch Demo User Schema
export const SwitchUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// Import validation limits
export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
export const ALLOWED_EXTENSIONS = [".txt", ".md", ".markdown"];
export const ALLOWED_MIME_TYPES = [
  "text/plain",
  "text/markdown",
  "text/x-markdown",
  "application/octet-stream", // Fallback for raw files
];
