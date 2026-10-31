"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/stores/createStore";
import { authStore, login } from "@/stores/authStore";
import { ApiError } from "@/lib/api/client";
import styles from "./LoginForm.module.css";

/** Login for team leaders and admins (handbook §4.1, §12.1). */
export function LoginForm() {
  const router = useRouter();
  const status = useStore(authStore, (s) => s.status);
  const role = useStore(authStore, (s) => s.role);

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>PromptArena Login</h1>
      <p className={styles.hint}>
        Use the user ID and password emailed to your team leader.
      </p>

      <label className={styles.field}>
        <span>User ID</span>
        <input
          type="text"
          name="user_id"
          autoComplete="username"
          required
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={submitting}
        />
      </label>

      <label className={styles.field}>
        <span>Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
        />
      </label>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
