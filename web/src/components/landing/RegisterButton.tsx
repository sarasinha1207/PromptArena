import Link from "next/link";
import shared from "./shared.module.css";

interface RegisterButtonProps {
  variant?: "primary" | "ghost";
  size?: "default" | "small";
}

/** Sends visitors to the team registration page. */
export function RegisterButton({ variant = "primary", size = "default" }: RegisterButtonProps) {
  const className = [
    shared.btn,
    variant === "primary" ? shared.btnPrimary : shared.btnGhost,
    size === "small" ? shared.btnSmall : "",
  ].join(" ");

  return (
    <Link href="/register" className={className}>
      Register your team
    </Link>
  );
}
