import type { Metadata, Viewport } from "next";
import { RegistrationPage } from "@/components/register/RegistrationPage";

export const metadata: Metadata = {
  title: "PromptArena Registration",
  description:
    "Register your team for PromptArena - Hack & Defend. 13 December, CLH, IIT Patna.",
};

export const viewport: Viewport = { themeColor: "#050a1c" };

export default function RegisterPage() {
  return <RegistrationPage />;
}
