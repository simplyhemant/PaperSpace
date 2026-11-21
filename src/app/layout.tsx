import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PaperSpace — Collaborative Document Editor",
  description: "A lightweight collaborative document workspace inspired by Google Docs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface font-sans text-on-surface antialiased">
        {children}
      </body>
    </html>
  );
}
