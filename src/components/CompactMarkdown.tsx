import type { ReactNode } from "react";

type Token =
  | { type: "heading"; level: number; text: string }
  | { type: "ordered"; items: string[] }
  | { type: "unordered"; items: string[] }
  | { type: "paragraph"; text: string };

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|§\s*\d+[^\n,;.]*)/g);
  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (/^§\s*\d+/.test(part)) {
      return <strong key={index}>{part}</strong>;
    }
    return part;
  });
}

function tokenize(markdown: string): Token[] {
  const clean = markdown
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[^\n]*\n?/g, ""))
    .replace(/^>\s?/gm, "")
    .trim();

  const lines = clean.split(/\r?\n/);
  const tokens: Token[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();
    if (text) tokens.push({ type: "paragraph", text });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      flushParagraph();
      continue;
    }

    const heading = line.match(/^(⇨{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      tokens.push({
        type: "heading",
        level: heading[1].length,
        text: heading[2].replace(/^["“”]|["“”]$/g, ""),
      });
      continue;
    }

    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      const items = [ordered[1]];
      while (i + 1 < lines.length) {
        const next = lines[i + 1].trim().match(/^\d+[.)]\s+(.+)$/);
        if (!next) break;
        items.push(next[1]);
        i++;
      }
      tokens.push({ type: "ordered", items });
      continue;
    }

    const unordered = line.match(/^[-*•]\s+(.+)$/);
    if (unordered) {
      flushParagraph();
      const items = [unordered[1]];
      while (i + 1 < lines.length) {
        const next = lines[i + 1].trim().match(/^[-*•]\s+(.+)$/);
        if (!next) break;
        items.push(next[1]);
        i++;
      }
      tokens.push({ type: "unordered", items });
      continue;
    }

    paragraph.push(line.replace(/^["“”]|["“”]$/g, ""));
  }

  flushParagraph();
  return tokens;
}

export function CompactMarkdown({ children }: { children: string }) {
  return (
    <div className="steuerstoff-markdown">
      {tokenize(children).map((token, index) => {
        if (token.type === "heading") {
          const Tag = token.level <= 2 ? "h3" : "h4";
          return <Tag key={index}>{inline(token.text)}</Tag>;
        }
        if (token.type === "ordered") {
          return (
            <ol key={index}>
              {token.items.map((item, itemIndex) => (
                <li key={itemIndex}>{inline(item)}</li>
              ))}
            </ol>
          );
        }
        if (token.type === "unordered") {
          return (
            <ul key={index}>
              {token.items.map((item, itemIndex) => (
                <li key={itemIndex}>{inline(item)}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{inline(token.text)}</p>;
      })}
    </div>
  );
}
