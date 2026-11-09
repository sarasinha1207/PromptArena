import type { CSSProperties } from "react";
import styles from "./rise.module.css";

/** Class and style props that fade a block in, `delay` seconds after the page loads. */
export function rise(delay = 0): { className: string; style: CSSProperties } {
  return { className: styles.rise, style: { "--d": `${delay}s` } as CSSProperties };
}
