"use client";

import Link from "next/link";
import { useStore } from "@/stores/createStore";
import { authStore } from "@/stores/authStore";
import shared from "./shared.module.css";

interface LoginButtonProps {
  variant?: "primary" | "ghost";
  size?: "default" | "small";
  /** Called after navigation intent, e.g. to close a mobile menu. */
  onClick?: () => void;
}

/** Sends visitors to the login page; signed-in users go straight to their area. */
export function LoginButton({
  variant = "primary",
  size = "default",
  onClick,
}: LoginButtonProps) {
  const status = useStore(authStore, (s) => s.status);
  const role = useStore(authStore, (s) => s.role);

  const signedIn = status === "authenticated";
  const href = !signedIn ? "/auth/login" : role === "admin" ? "/admin/dashboard" : "/arena";
  const label = !signedIn ? "Log in" : role === "admin" ? "Open admin" : "Enter the arena";

  const className = [
    shared.btn,
    variant === "primary" ? shared.btnPrimary : shared.btnGhost,
    size === "small" ? shared.btnSmall : "",
  ].join(" ");

  return (
    <Link href={href} className={className} onClick={onClick}>
      {label}
    </Link>
  );
}
