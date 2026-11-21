import { ShareRole } from "@prisma/client";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface DocumentShareDetail {
  id: string;
  documentId: string;
  userId: string;
  role: ShareRole;
  createdAt: string;
  user: UserSummary;
}

export interface DocumentListItem {
  id: string;
  title: string;
  ownerId: string;
  owner: UserSummary;
  role: "OWNER" | "EDITOR" | "VIEWER";
  createdAt: string;
  updatedAt: string;
  snippet?: string;
  sharesCount?: number;
}

export interface DocumentDetail {
  id: string;
  title: string;
  content: any;
  ownerId: string;
  owner: UserSummary;
  role: "OWNER" | "EDITOR" | "VIEWER";
  shares: DocumentShareDetail[];
  createdAt: string;
  updatedAt: string;
}
