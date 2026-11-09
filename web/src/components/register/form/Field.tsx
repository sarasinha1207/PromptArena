import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Field.module.css";

/** Two-column layout for fields (one column on phones). */
export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}

interface FieldFrameProps {
  id: string;
  label: string;
  required?: boolean;
  wide?: boolean;
  error?: string;
  children: ReactNode;
}

/** Label above the control, and the field's own error message below it. */
function FieldFrame({ id, label, required, wide, error, children }: FieldFrameProps) {
  return (
    <div className={`${styles.field} ${wide ? styles.wide : ""}`}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {children}
      {error && (
        <p className={styles.error} id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "value" | "onChange"> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  wide?: boolean;
  error?: string;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  wide,
  error,
  required,
  ...inputProps
}: TextFieldProps) {
  return (
    <FieldFrame id={id} label={label} required={required} wide={wide} error={error}>
      <input
        {...inputProps}
        id={id}
        name={id}
        className={styles.control}
        required={required}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldFrame>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder: string;
  required?: boolean;
  error?: string;
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  error,
}: SelectFieldProps) {
  return (
    <FieldFrame id={id} label={label} required={required} error={error}>
      <select
        id={id}
        name={id}
        className={`${styles.control} ${styles.select}`}
        required={required}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldFrame>
  );
}
