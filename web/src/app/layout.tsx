import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/AppProviders";
import "@/styles/globals.css";

/*
 * Fonts are bundled in src/fonts (latin subset), not fetched from Google at
 * build or dev time, so pages never wait on an external network call.
 */

// Unbounded: wide, geometric display face for headlines.
const display = localFont({
  src: "../fonts/Unbounded-500-900.woff2",
  weight: "500 900",
  variable: "--font-display-loaded",
  display: "swap",
});

// Manrope: body text.
const body = localFont({
  src: "../fonts/Manrope-200-800.woff2",
  weight: "200 800",
  variable: "--font-body-loaded",
  display: "swap",
});

// Space Mono: terminals, flags and code-like text.
const mono = localFont({
  src: [
    { path: "../fonts/SpaceMono-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/SpaceMono-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-mono-loaded",
  display: "swap",
});

// Cinzel: engraved, Middle-earth style capitals for the public pages.
const cinzel = localFont({
  src: "../fonts/Cinzel-400-900.woff2",
  weight: "400 900",
  variable: "--font-cinzel-loaded",
  display: "swap",
});

// Cinzel Decorative: the PromptArena wordmark on the landing page.
const cinzelDeco = localFont({
  src: [
    { path: "../fonts/CinzelDecorative-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/CinzelDecorative-900.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-cinzel-deco-loaded",
  display: "swap",
});

// Crimson Pro: the warm book serif for copy on the public pages.
const crimson = localFont({
  src: "../fonts/CrimsonPro-300-800.woff2",
  weight: "300 800",
  variable: "--font-crimson-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PromptArena",
  description:
    "An adversarial competition for the AI era: attack and defend large language models with natural language.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // data-scroll-behavior: Next.js turns off smooth scrolling during route changes.
    // suppressHydrationWarning on <body>: browser extensions and page zoom add attributes
    // to <body> before React loads, which is not a bug in this app.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable} ${mono.variable} ${cinzel.variable} ${cinzelDeco.variable} ${crimson.variable}`}
    >
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
