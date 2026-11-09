import { useId } from "react";
import { COURSES, SEMESTERS } from "@/content/registration";
import type { RegistrationMember } from "@/lib/api/registration";
import { FieldGrid, SelectField, TextField } from "./Field";
import styles from "./MemberCard.module.css";

const COURSE_OPTIONS = COURSES.map((course) => ({ value: course, label: course }));
const SEMESTER_OPTIONS = SEMESTERS.map((semester) => ({
  value: semester,
  label: `Semester ${semester}`,
}));

/** Name of a member by position, used on the card and in messages. */
export const memberLabel = (index: number) => (index === 0 ? "Team leader" : `Member ${index + 1}`);

interface MemberCardProps {
  index: number;
  /** Members beyond the chosen team size are hidden and skipped by validation. */
  disabled: boolean;
  value: RegistrationMember;
  /** Problems found for this member's fields, by input id. */
  errors: Record<string, string>;
  onChange: (field: keyof RegistrationMember, value: string) => void;
}

export function MemberCard({ index, disabled, value, errors, onChange }: MemberCardProps) {
  const headingId = useId();
  const leader = index === 0;
  const id = (field: string) => `${field}_${index}`;

  return (
    <fieldset className={styles.member} disabled={disabled} aria-labelledby={headingId}>
      <div className={styles.head}>
        <span className={styles.number} aria-hidden="true">
          {index + 1}
        </span>
        <h3 className={styles.name} id={headingId}>
          {memberLabel(index)}
        </h3>
        {leader && <span className={styles.tag}>Leader</span>}
      </div>

      <FieldGrid>
        <TextField
          id={id("name")}
          label="Full name"
          wide
          required
          maxLength={80}
          autoComplete={leader ? "name" : "off"}
          placeholder="Enter full name"
          value={value.name}
          error={errors[id("name")]}
          onChange={(next) => onChange("name", next)}
        />
        <SelectField
          id={id("course")}
          label="Course"
          required
          placeholder="Select course"
          options={COURSE_OPTIONS}
          value={value.course}
          error={errors[id("course")]}
          onChange={(next) => onChange("course", next)}
        />
        <SelectField
          id={id("sem")}
          label="Semester"
          required
          placeholder="Select semester"
          options={SEMESTER_OPTIONS}
          value={value.semester}
          error={errors[id("sem")]}
          onChange={(next) => onChange("semester", next)}
        />
        <TextField
          id={id("email")}
          label="College email ID"
          type="email"
          required
          autoComplete={leader ? "email" : "off"}
          placeholder="name@iitp.ac.in"
          value={value.email}
          error={errors[id("email")]}
          onChange={(next) => onChange("email", next)}
        />
        <TextField
          id={id("phone")}
          label="Phone number"
          type="tel"
          inputMode="numeric"
          required
          pattern="[0-9]{10}"
          maxLength={10}
          autoComplete={leader ? "tel-national" : "off"}
          placeholder="10-digit mobile number"
          title="Enter a 10-digit mobile number"
          value={value.phone}
          error={errors[id("phone")]}
          onChange={(next) => onChange("phone", next.replace(/\D/g, "").slice(0, 10))}
        />
      </FieldGrid>
    </fieldset>
  );
}
