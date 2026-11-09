import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary";

const classes = (variant: Variant) => `${styles.button} ${styles[variant]}`;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={classes(variant)} {...props} />;
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
}

/** A link that looks like a button, e.g. a file download. */
export function ButtonLink({ variant = "secondary", ...props }: ButtonLinkProps) {
  return <a className={classes(variant)} {...props} />;
}
