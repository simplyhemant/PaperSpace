export interface TipTapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
  text?: string;
}

export interface TipTapDoc {
  type: "doc";
  content: TipTapNode[];
}

/**
 * Parses inline markdown marks (bold, italic, code) into TipTap text nodes with marks.
 */
function parseInlineMarkdown(text: string): TipTapNode[] {
  if (!text) return [];

  const nodes: TipTapNode[] = [];
  // Simple token regex for bold (**text**), italic (*text*), inline code (`code`)
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|([^*`]+))/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const full = match[0];
    if (match[2]) {
      // Bold
      nodes.push({
        type: "text",
        text: match[2],
        marks: [{ type: "bold" }],
      });
    } else if (match[3]) {
      // Italic
      nodes.push({
        type: "text",
        text: match[3],
        marks: [{ type: "italic" }],
      });
    } else if (match[4]) {
      // Inline code
      nodes.push({
        type: "text",
        text: match[4],
        marks: [{ type: "code" }],
      });
    } else if (match[5]) {
      // Plain text
      nodes.push({
        type: "text",
        text: match[5],
      });
    }
  }

  return nodes.length > 0 ? nodes : [{ type: "text", text }];
}

/**
 * Converts raw Markdown or Plain Text string into a structured TipTap Document JSON tree.
 */
export function convertTextToTipTap(rawContent: string, isMarkdown: boolean): TipTapDoc {
  const lines = rawContent.replace(/\r\n/g, "\n").split("\n");
  const docContent: TipTapNode[] = [];

  let currentBulletList: TipTapNode[] | null = null;
  let currentOrderedList: TipTapNode[] | null = null;

  function flushLists() {
    if (currentBulletList) {
      docContent.push({
        type: "bulletList",
        content: currentBulletList,
      });
      currentBulletList = null;
    }
    if (currentOrderedList) {
      docContent.push({
        type: "orderedList",
        content: currentOrderedList,
      });
      currentOrderedList = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushLists();
      continue;
    }

    if (isMarkdown) {
      // Heading 1
      if (line.startsWith("# ")) {
        flushLists();
        docContent.push({
          type: "heading",
          attrs: { level: 1 },
          content: parseInlineMarkdown(line.slice(2).trim()),
        });
        continue;
      }

      // Heading 2
      if (line.startsWith("## ")) {
        flushLists();
        docContent.push({
          type: "heading",
          attrs: { level: 2 },
          content: parseInlineMarkdown(line.slice(3).trim()),
        });
        continue;
      }

      // Heading 3
      if (line.startsWith("### ")) {
        flushLists();
        docContent.push({
          type: "heading",
          attrs: { level: 3 },
          content: parseInlineMarkdown(line.slice(4).trim()),
        });
        continue;
      }

      // Blockquote
      if (line.startsWith("> ")) {
        flushLists();
        docContent.push({
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: parseInlineMarkdown(line.slice(2).trim()),
            },
          ],
        });
        continue;
      }

      // Bullet List (- or *)
      if (line.startsWith("- ") || line.startsWith("* ")) {
        if (!currentBulletList) {
          flushLists();
          currentBulletList = [];
        }
        currentBulletList.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: parseInlineMarkdown(line.slice(2).trim()),
            },
          ],
        });
        continue;
      }

      // Ordered List (1. 2. etc.)
      const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (orderedMatch) {
        if (!currentOrderedList) {
          flushLists();
          currentOrderedList = [];
        }
        currentOrderedList.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: parseInlineMarkdown(orderedMatch[2].trim()),
            },
          ],
        });
        continue;
      }
    }

    // Default Paragraph
    flushLists();
    docContent.push({
      type: "paragraph",
      content: isMarkdown ? parseInlineMarkdown(trimmed) : [{ type: "text", text: trimmed }],
    });
  }

  flushLists();

  if (docContent.length === 0) {
    docContent.push({
      type: "paragraph",
      content: [],
    });
  }

  return {
    type: "doc",
    content: docContent,
  };
}

/**
 * Derives a clean document title from filename.
 * e.g., "engineering-roadmap.v2.md" -> "Engineering Roadmap V2"
 */
export function deriveTitleFromFilename(filename: string): string {
  const withoutExt = filename.replace(/\.[^/.]+$/, "");
  const cleaned = withoutExt
    .replace(/[-_.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "Imported Document";

  // Title case conversion
  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
