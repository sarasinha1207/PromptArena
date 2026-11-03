import type { CSSProperties, ReactNode } from "react";
import { resolveTheme } from "@/lib/theme/personaThemes";
import type { ThemeConfig } from "@/types/arena";

interface ThemeProviderProps {
  config: ThemeConfig | undefined;
  className?: string;
  children: ReactNode;
}

/**
 * Applies a persona's colours and fonts to everything inside it (handbook §3,
 * §14 Sprint 2). Components read `--theme-*` variables and never check which
 * persona they are showing, so a new `theme_id` needs no component changes.
 */
export function ThemeProvider({ config, className, children }: ThemeProviderProps) {
  const theme = resolveTheme(config);

  const style = {
    "--theme-accent": theme.accent,
    "--theme-font": theme.font,
    "--theme-font-style": theme.fontStyle,
    "--theme-font-transform": theme.fontTransform,
    "--theme-font-size": theme.fontSize,
  } as CSSProperties;

  return (
    <div className={className} data-theme={theme.id} style={style}>
      {children}
    </div>
  );
}
