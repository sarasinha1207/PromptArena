import type { RegistrationPayload } from "@/lib/api/registration";

/** The team's own copy of their registration, offered on the success screen. */
export function registrationToCsv(payload: RegistrationPayload & { id: string }): string {
  // A leading =, +, - or @ would run as a formula in a spreadsheet, so it is prefixed with '.
  const cell = (value: unknown) => {
    let text = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const head = [
    "Registration ID",
    "Team Name",
    "Team Size",
    "Role",
    "Name",
    "Course",
    "Semester",
    "College Email",
    "Phone",
  ];
  const rows = payload.members.map((m, i) => [
    payload.id,
    payload.teamName,
    payload.teamSize,
    i === 0 ? "Leader" : "Member",
    m.name,
    m.course,
    m.semester,
    m.email,
    m.phone,
  ]);
  return [head, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
}
