import { LeadStatus, STATUS_MAP } from "../db/schema";

// Valid status transitions
const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new: ["contacted"],
  contacted: ["replied", "nurture", "lost"],
  replied: ["booked", "nurture", "lost"],
  booked: ["closed", "lost"],
  closed: [],
  nurture: ["contacted", "lost"],
  lost: ["contacted"], // Can re-engage lost leads
};

export function canTransition(
  from: LeadStatus,
  to: LeadStatus
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getValidNextStatuses(current: LeadStatus): LeadStatus[] {
  return VALID_TRANSITIONS[current] ?? [];
}

export function mapOutcomeToStatus(outcome: string): LeadStatus | undefined {
  return STATUS_MAP[outcome];
}

export function validateStatus(status: string): status is LeadStatus {
  return [
    "new",
    "contacted",
    "replied",
    "booked",
    "closed",
    "nurture",
    "lost",
  ].includes(status);
}
