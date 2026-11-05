import type { ReactNode } from "react";

/**
 * Renders a bot reply. Model output is hostile (handbook §13.1), so this never
 * builds HTML strings and never uses dangerouslySetInnerHTML. It understands a
 * small Markdown subset (paragraphs, lists, **bold**, *italic*, `code`, fenced
 * code) and produces React elements only. Anything else, including <script>,
 * <iframe>, <object>, inline handlers and links, is shown as plain text.
 */

const INLINE = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\*[^*\n]+\*|_[^_\n]+_)/g;

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    if (
      ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) &&
      part.length > 2
    ) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function renderLines(text: string, keyPrefix: string): ReactNode[] {
  const blocks = text.split(/\n{2,}/);
  return blocks.map((block, blockIndex) => {
    const lines = block.split("\n");
    const key = `${keyPrefix}-${blockIndex}`;

    if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
      return (
        <ul key={key}>
          {lines.map((line, i) => (
            <li key={i}>{renderInline(line.replace(/^\s*[-*]\s+/, ""))}</li>
          ))}
        </ul>
      );
    }
    if (lines.every((line) => /^\s*\d+[.)]\s+/.test(line))) {
      return (
        <ol key={key}>
          {lines.map((line, i) => (
            <li key={i}>{renderInline(line.replace(/^\s*\d+[.)]\s+/, ""))}</li>
          ))}
        </ol>
      );
    }
    return (
      <p key={key}>
        {lines.map((line, i) => (
          <span key={i}>
            {i > 0 && <br />}
            {renderInline(line)}
          </span>
        ))}
      </p>
    );
  });
}

export function SafeMessage({ text }: { text: string }) {
  // Split on fenced code blocks first, so their contents are never parsed as Markdown.
  const parts = text.split(/```/);
  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          const code = part.replace(/^[^\n]*\n/, "");
          return (
            <pre key={index}>
              <code>{code.replace(/\n$/, "")}</code>
            </pre>
          );
        }
        return part.trim() === "" ? null : <div key={index}>{renderLines(part.trim(), String(index))}</div>;
      })}
    </>
  );
}
