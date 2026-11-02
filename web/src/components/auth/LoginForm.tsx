"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/stores/createStore";
import { authStore, login } from "@/stores/authStore";
import { ApiError } from "@/lib/api/client";
import { REGISTRATION_URL, SUPPORT_EMAIL } from "@/lib/config";
import { LogoMark } from "@/components/landing/LogoMark";
import styles from "./LoginForm.module.css";

/** Login for team leaders and admins (handbook §4.1, §12.1). */
export function LoginForm() {
  const router = useRouter();
  const status = useStore(authStore, (s) => s.status);
  const role = useStore(authStore, (s) => s.role);

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<"forgot" | "register" | null>(null);

  // Already signed in (stored session): go straight to the right area.
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(role === "admin" ? "/admin/dashboard" : "/arena");
    }
  }, [status, role, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const signedInRole = await login(userId.trim(), password);
      router.replace(signedInRole === "admin" ? "/admin/dashboard" : "/arena");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 401
            ? "Invalid user ID or password."
            : err.message
          : "Something went wrong. Please try again.",
      );
      setErrorCount((count) => count + 1);
      setSubmitting(false);
    }
  }

  return (
    <form
      key={`form-${errorCount}`}
      className={styles.card}
      data-shake={errorCount > 0 && error !== null}
      onSubmit={handleSubmit}
      noValidate={false}
    >
      <div className={styles.header}>
        <span className={styles.logo}>
          <LogoMark size={44} />
        </span>
        <h1 className={styles.title}>Log in to PromptArena</h1>
        <p className={styles.hint}>
          Use the user ID and password emailed to your team leader.
        </p>
      </div>

      <div className={styles.field}>
        <input
          id="user_id"
          type="text"
          name="user_id"
          autoComplete="username"
          placeholder=" "
          required
          autoFocus
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={submitting}
        />
        <label htmlFor="user_id">User ID</label>
      </div>

      <div className={styles.field}>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete="current-password"
          placeholder=" "
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
        />
        <label htmlFor="password">Password</label>
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={showPassword}
          onClick={() => setShowPassword((visible) => !visible)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <div className={styles.forgotRow}>
        <button
          type="button"
          className={styles.linkButton}
          aria-expanded={notice === "forgot"}
          onClick={() => setNotice((current) => (current === "forgot" ? null : "forgot"))}
        >
          Forgot password?
        </button>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting && <span className={styles.spinner} aria-hidden="true" />}
        <span>{submitting ? "Logging in" : "Log in"}</span>
      </button>

      {notice === "forgot" && (
        <p className={styles.notice} role="status">
          Passwords are issued by the event organizers. Ask the event coordinator to reset
          yours.
          {SUPPORT_EMAIL && (
            <>
              {" "}
              <a href={`mailto:${SUPPORT_EMAIL}`}>Email the coordinator</a>.
            </>
          )}
        </p>
      )}

      <div className={styles.divider}>
        <span>New team?</span>
      </div>

      {REGISTRATION_URL ? (
        <a
          className={styles.register}
          href={REGISTRATION_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Register now
        </a>
      ) : (
        <button
          type="button"
          className={styles.register}
          aria-expanded={notice === "register"}
          onClick={() => setNotice((current) => (current === "register" ? null : "register"))}
        >
          Register now
        </button>
      )}

      {notice === "register" && !REGISTRATION_URL && (
        <p className={styles.notice} role="status">
          Teams register through a form the event coordinator will share. Once you register,
          your user ID and password arrive by email.
        </p>
      )}
    </form>
  );
}
