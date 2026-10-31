import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/AppProviders";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "PromptArena",
  description: "Adversarial LLM competition platform: Red Teaming, Blue Teaming and live Red vs. Blue.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
