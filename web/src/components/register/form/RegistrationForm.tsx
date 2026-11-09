"use client";

import type {
  RegistrationPayload,
  RegistrationResult,
} from "@/lib/api/registration";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { rise } from "../ui/rise";
import { FieldGrid, SelectField, TextField } from "./Field";
import { MemberCard } from "./MemberCard";
import { ProgressBar } from "./ProgressBar";
import { useRegistrationForm } from "./useRegistrationForm";
import styles from "./RegistrationForm.module.css";

const TEAM_SIZE_OPTIONS = [
  { value: "1", label: "1 member (solo)" },
  { value: "2", label: "2 members" },
  { value: "3", label: "3 members" },
];

interface RegistrationFormProps {
  onRegistered: (payload: RegistrationPayload, result: RegistrationResult) => void;
}

/** The team registration form: team details, one card per member, and the submit button. */
export function RegistrationForm({ onRegistered }: RegistrationFormProps) {
  const form = useRegistrationForm(onRegistered);
  const entrance = rise(0.45);

  return (
    <Card
      title="Team registration"
      description="Fields marked with * are required."
      className={entrance.className}
      style={entrance.style}
    >
      <form ref={form.formRef} noValidate onSubmit={form.submit}>
        <ProgressBar percent={form.percent} />

        <h3 className={styles.sectionTitle}>Team details</h3>
        <FieldGrid>
          <TextField
            id="teamName"
            label="Team name"
            required
            maxLength={60}
            autoComplete="off"
            placeholder="e.g. Null Pointers"
            value={form.teamName}
            error={form.fieldErrors.teamName}
            onChange={form.changeTeamName}
          />
          <SelectField
            id="teamSize"
            label="No. of team members"
            required
            placeholder="Select team size"
            options={TEAM_SIZE_OPTIONS}
            value={form.teamSize}
            error={form.fieldErrors.teamSize}
            onChange={form.changeTeamSize}
          />
        </FieldGrid>
        <p className={styles.hint}>
          Team size includes the team leader. Fields appear for each member.
        </p>

        <div className={styles.members}>
          {form.members.map((member, index) => (
            <MemberCard
              key={index}
              index={index}
              disabled={index >= form.shown}
              value={member}
              errors={form.fieldErrors}
              onChange={(field, value) => form.changeMember(index, field, value)}
            />
          ))}
        </div>

        {form.alert && (
          <div className={styles.alert} key={form.alert.key} role="alert">
            <svg className={styles.alertIcon} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.5v5.5M12 16.5h.01" />
            </svg>
            {form.alert.text}
          </div>
        )}

        <div className={styles.actions}>
          <Button type="submit" disabled={form.submitting}>
            {form.submitting ? "Submitting…" : "Register team"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
