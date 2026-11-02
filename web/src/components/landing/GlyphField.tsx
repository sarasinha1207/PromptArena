import type { CSSProperties } from "react";
import styles from "./GlyphField.module.css";

/** Prompt-injection flavoured glyphs that drift upward. Fixed layout so server and client match. */
const GLYPHS = [
  { t: ">_", l: 6, s: 1.4, d: 16, o: 0 },
  { t: "{ }", l: 14, s: 1.1, d: 21, o: 4 },
  { t: "0x4A", l: 23, s: 0.95, d: 18, o: 9 },
  { t: "FLAG{", l: 31, s: 1.0, d: 24, o: 2 },
  { t: "</>", l: 40, s: 1.3, d: 19, o: 7 },
  { t: "403", l: 48, s: 1.1, d: 22, o: 12 },
  { t: "::", l: 56, s: 1.5, d: 17, o: 5 },
  { t: "sudo", l: 64, s: 0.95, d: 23, o: 10 },
  { t: "%s", l: 72, s: 1.2, d: 20, o: 1 },
  { t: "ICE", l: 80, s: 1.0, d: 25, o: 8 },
  { t: "[ ]", l: 88, s: 1.3, d: 18, o: 3 },
  { t: "&&", l: 94, s: 1.1, d: 21, o: 11 },
];

interface GlyphFieldProps {
  tone?: "red" | "blue" | "mixed";
  className?: string;
}

export function GlyphField({ tone = "mixed", className = "" }: GlyphFieldProps) {
  return (
    <div className={`${styles.field} ${className}`} data-tone={tone} aria-hidden="true">
      {GLYPHS.map((glyph, index) => (
        <span
          key={glyph.t}
          className={styles.glyph}
          data-alt={index % 2 === 0}
          style={
            {
              left: `${glyph.l}%`,
              fontSize: `${glyph.s}rem`,
              animationDuration: `${glyph.d}s`,
              animationDelay: `-${glyph.o}s`,
            } as CSSProperties
          }
        >
          {glyph.t}
        </span>
      ))}
    </div>
  );
}
