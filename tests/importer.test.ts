import { describe, it, expect } from "vitest";
import { convertTextToTipTap, deriveTitleFromFilename } from "@/lib/importer";

describe("Markdown and Plain Text TipTap Importer", () => {
  describe("convertTextToTipTap (Markdown)", () => {
    it("converts markdown headings into TipTap heading nodes with correct levels", () => {
      const markdown = "# Heading One\n\n## Heading Two\n\n### Heading Three";
      const doc = convertTextToTipTap(markdown, true);

      expect(doc.type).toBe("doc");
      expect(doc.content).toHaveLength(3);

      expect(doc.content[0].type).toBe("heading");
      expect(doc.content[0].attrs?.level).toBe(1);
      expect(doc.content[0].content?.[0].text).toBe("Heading One");

      expect(doc.content[1].type).toBe("heading");
      expect(doc.content[1].attrs?.level).toBe(2);
      expect(doc.content[1].content?.[0].text).toBe("Heading Two");

      expect(doc.content[2].type).toBe("heading");
      expect(doc.content[2].attrs?.level).toBe(3);
      expect(doc.content[2].content?.[0].text).toBe("Heading Three");
    });

    it("converts bullet list items into a bulletList node with listItems", () => {
      const markdown = "- Alpha\n- Beta\n- Gamma";
      const doc = convertTextToTipTap(markdown, true);

      expect(doc.content).toHaveLength(1);
      expect(doc.content[0].type).toBe("bulletList");
      expect(doc.content[0].content).toHaveLength(3);
      expect(doc.content[0].content?.[0].type).toBe("listItem");
    });

    it("converts ordered list items into an orderedList node with listItems", () => {
      const markdown = "1. First step\n2. Second step";
      const doc = convertTextToTipTap(markdown, true);

      expect(doc.content).toHaveLength(1);
      expect(doc.content[0].type).toBe("orderedList");
      expect(doc.content[0].content).toHaveLength(2);
      expect(doc.content[0].content?.[0].type).toBe("listItem");
    });

    it("converts blockquotes into blockquote nodes", () => {
      const markdown = "> Critical design requirement";
      const doc = convertTextToTipTap(markdown, true);

      expect(doc.content).toHaveLength(1);
      expect(doc.content[0].type).toBe("blockquote");
      expect(doc.content[0].content?.[0].content?.[0].text).toBe("Critical design requirement");
    });

    it("parses inline bold, italic, and code marks", () => {
      const markdown = "This text has **bold**, *italic*, and `code` inline.";
      const doc = convertTextToTipTap(markdown, true);

      const paragraph = doc.content[0];
      expect(paragraph.type).toBe("paragraph");

      const boldNode = paragraph.content?.find((c) => c.marks?.some((m) => m.type === "bold"));
      expect(boldNode).toBeDefined();
      expect(boldNode?.text).toBe("bold");

      const italicNode = paragraph.content?.find((c) => c.marks?.some((m) => m.type === "italic"));
      expect(italicNode).toBeDefined();
      expect(italicNode?.text).toBe("italic");

      const codeNode = paragraph.content?.find((c) => c.marks?.some((m) => m.type === "code"));
      expect(codeNode).toBeDefined();
      expect(codeNode?.text).toBe("code");
    });
  });

  describe("convertTextToTipTap (Plain Text)", () => {
    it("converts multi-line plain text into paragraph nodes", () => {
      const text = "Paragraph one with notes.\n\nParagraph two with summary.";
      const doc = convertTextToTipTap(text, false);

      expect(doc.type).toBe("doc");
      expect(doc.content).toHaveLength(2);
      expect(doc.content[0].type).toBe("paragraph");
      expect(doc.content[0].content?.[0].text).toBe("Paragraph one with notes.");
      expect(doc.content[1].content?.[0].text).toBe("Paragraph two with summary.");
    });

    it("handles empty string gracefully", () => {
      const doc = convertTextToTipTap("", true);
      expect(doc.type).toBe("doc");
      expect(doc.content).toHaveLength(1);
      expect(doc.content[0].type).toBe("paragraph");
    });
  });

  describe("deriveTitleFromFilename", () => {
    it("converts kebab-case filename into Title Case without extension", () => {
      expect(deriveTitleFromFilename("system-architecture-spec.md")).toBe(
        "System Architecture Spec"
      );
    });

    it("converts snake_case filename into Title Case", () => {
      expect(deriveTitleFromFilename("user_interview_summary.txt")).toBe(
        "User Interview Summary"
      );
    });

    it("handles multiple dots and special separators", () => {
      expect(deriveTitleFromFilename("q4.roadmap.final.v2.markdown")).toBe(
        "Q4 Roadmap Final V2"
      );
    });

    it("provides fallback for empty filename", () => {
      expect(deriveTitleFromFilename(".md")).toBe("Imported Document");
    });
  });
});
