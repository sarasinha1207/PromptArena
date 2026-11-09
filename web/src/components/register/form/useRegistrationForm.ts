"use client";

import { useRef, useState, type FormEvent } from "react";
import { MAX_MEMBERS } from "@/content/registration";
import {
  RegistrationError,
  submitRegistration,
  type RegistrationMember,
  type RegistrationPayload,
  type RegistrationResult,
} from "@/lib/api/registration";

const emptyMember = (): RegistrationMember => ({
  name: "",
  course: "",
  semester: "",
  email: "",
  phone: "",
});

/** Id of the input for a member field. The semester input is "sem_<n>". */
const memberInputId = (field: keyof RegistrationMember, index: number) =>
  `${field === "semester" ? "sem" : field}_${index}`;

/** Maps a server field path ("members.1.email") to the id of the matching input. */
function fieldToInputId(path: string): string | null {
  const match = /^members\.(\d+)\.(name|course|semester|email|phone)$/.exec(path);
  if (match) return memberInputId(match[2] as keyof RegistrationMember, Number(match[1]));
  return path === "teamName" || path === "teamSize" ? path : null;
}

/**
 * State and behaviour of the team registration form: values, progress, checks,
 * the server's per-field problems, and the submit itself. The components only draw it.
 */
export function useRegistrationForm(
  onRegistered: (payload: RegistrationPayload, result: RegistrationResult) => void,
) {
  const formRef = useRef<HTMLFormElement>(null);

  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [members, setMembers] = useState<RegistrationMember[]>(() =>
    Array.from({ length: MAX_MEMBERS }, emptyMember),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // A new key restarts the alert's shake animation even when the text is unchanged.
  const [alert, setAlert] = useState<{ text: string; key: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /** Members shown: the leader always, then as many as the chosen team size. */
  const shown = Math.max(1, Number(teamSize) || 1);

  // Progress: share of the visible fields that are filled in.
  const visibleValues = [
    teamName,
    teamSize,
    ...members.slice(0, shown).flatMap((m) => [m.name, m.course, m.semester, m.email, m.phone]),
  ];
  const percent = Math.round(
    (visibleValues.filter((value) => value.trim() !== "").length / visibleValues.length) * 100,
  );

  const showAlert = (text: string) =>
    setAlert((current) => ({ text, key: (current?.key ?? 0) + 1 }));

  const clearFieldError = (id: string) =>
    setFieldErrors((errors) => {
      if (!(id in errors)) return errors;
      const { [id]: _removed, ...rest } = errors;
      return rest;
    });

  const changeTeamName = (value: string) => {
    clearFieldError("teamName");
    setTeamName(value);
  };

  const changeTeamSize = (value: string) => {
    clearFieldError("teamSize");
    setTeamSize(value);
  };

  const changeMember = (index: number, field: keyof RegistrationMember, value: string) => {
    clearFieldError(memberInputId(field, index));
    setMembers((list) => list.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  /** Shows the server's problems beside the fields they belong to. */
  const showApiError = (error: RegistrationError) => {
    const found: Record<string, string> = {};
    for (const problem of error.errors) {
      const id = fieldToInputId(problem.field);
      if (id && !(id in found)) found[id] = problem.message;
    }
    setFieldErrors(found);
    const firstId = Object.keys(found)[0];
    if (firstId) document.getElementById(firstId)?.focus();
    showAlert(error.message);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAlert(null);
    setFieldErrors({});

    // The browser checks required fields, the email format and the 10-digit phone.
    if (!formRef.current?.reportValidity()) {
      showAlert("Please fill in all required fields correctly.");
      return;
    }

    const size = Number(teamSize);
    const payload: RegistrationPayload = {
      teamName: teamName.trim(),
      teamSize: size,
      members: members.slice(0, size).map((m) => ({
        name: m.name.trim(),
        course: m.course,
        semester: m.semester,
        email: m.email.trim().toLowerCase(),
        phone: m.phone.trim(),
      })),
    };

    const emails = payload.members.map((m) => m.email);
    const phones = payload.members.map((m) => m.phone);
    if (new Set(emails).size !== emails.length || new Set(phones).size !== phones.length) {
      showAlert("Each team member needs a different email and phone number.");
      return;
    }

    setSubmitting(true);
    try {
      onRegistered(payload, await submitRegistration(payload));
    } catch (error) {
      if (error instanceof RegistrationError) showApiError(error);
      else showAlert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formRef,
    teamName,
    teamSize,
    members,
    shown,
    percent,
    fieldErrors,
    alert,
    submitting,
    changeTeamName,
    changeTeamSize,
    changeMember,
    submit,
  };
}
