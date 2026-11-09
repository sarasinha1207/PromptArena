import { API_BASE_URL } from "@/lib/config";

export interface RegistrationMember {
  name: string;
  course: string;
  semester: string;
  email: string;
  phone: string;
}

export interface RegistrationPayload {
  teamName: string;
  teamSize: number;
  members: RegistrationMember[];
}

export interface RegistrationResult {
  id: string;
  teamName: string;
}

export interface FieldProblem {
  field: string;
  message: string;
}

/** Carries the server's message and the per-field problems it found. */
export class RegistrationError extends Error {
  readonly errors: FieldProblem[];

  constructor(message: string, errors: FieldProblem[] = []) {
    super(message);
    this.name = "RegistrationError";
    this.errors = errors;
  }
}

/** Sends a team registration. Resolves with the new registration, or throws RegistrationError. */
export async function submitRegistration(
  payload: RegistrationPayload,
): Promise<RegistrationResult> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new RegistrationError("Couldn't reach the server. Check your connection and try again.");
  }

  const body = (await response.json().catch(() => ({}))) as {
    message?: string;
    errors?: FieldProblem[];
    id?: string;
    teamName?: string;
  };
  if (!response.ok) {
    throw new RegistrationError(
      body.message || "Something went wrong. Please try again.",
      body.errors ?? [],
    );
  }
  return { id: body.id ?? "", teamName: body.teamName ?? payload.teamName };
}
