// Finite-State Machine (FSM) Lifecycle for MITS Grievance Management System (GMS)
// Full lifecycle per spec:
//   Submitted → Assigned → Under Review → In Progress → Resolved → Closed | Reopened
//   Extra: No Progress, Escalated (from In Progress)
// Strict rule: No skipping states.

export const COMPLAINT_STATUSES = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under review',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In progress',
  NO_PROGRESS: 'No Progress',
  ESCALATED: 'Escalated',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
  REJECTED: 'Rejected'
};

export const FSM_TRANSITIONS = {
  [COMPLAINT_STATUSES.SUBMITTED]: [
    COMPLAINT_STATUSES.UNDER_REVIEW,
    COMPLAINT_STATUSES.REJECTED
  ],
  [COMPLAINT_STATUSES.UNDER_REVIEW]: [
    COMPLAINT_STATUSES.ASSIGNED,
    COMPLAINT_STATUSES.REJECTED
  ],
  [COMPLAINT_STATUSES.ASSIGNED]: [
    COMPLAINT_STATUSES.IN_PROGRESS,
    COMPLAINT_STATUSES.REJECTED
  ],
  [COMPLAINT_STATUSES.IN_PROGRESS]: [
    COMPLAINT_STATUSES.RESOLVED,
    COMPLAINT_STATUSES.NO_PROGRESS,
    COMPLAINT_STATUSES.ESCALATED,
    COMPLAINT_STATUSES.REJECTED
  ],
  [COMPLAINT_STATUSES.NO_PROGRESS]: [
    COMPLAINT_STATUSES.IN_PROGRESS,
    COMPLAINT_STATUSES.ESCALATED
  ],
  [COMPLAINT_STATUSES.ESCALATED]: [
    COMPLAINT_STATUSES.IN_PROGRESS,
    COMPLAINT_STATUSES.RESOLVED
  ],
  [COMPLAINT_STATUSES.RESOLVED]: [
    COMPLAINT_STATUSES.CLOSED
  ],
  [COMPLAINT_STATUSES.CLOSED]: [
    COMPLAINT_STATUSES.REOPENED
  ],
  [COMPLAINT_STATUSES.REOPENED]: [
    COMPLAINT_STATUSES.UNDER_REVIEW,
    COMPLAINT_STATUSES.IN_PROGRESS
  ],
  [COMPLAINT_STATUSES.REJECTED]: []
};

/**
 * Returns array of valid next statuses from a given current status.
 */
export function getNextValidStatuses(currentStatus) {
  if (!currentStatus) return [COMPLAINT_STATUSES.SUBMITTED];
  return FSM_TRANSITIONS[currentStatus] || [];
}

/**
 * Validates if transition from currentStatus to newStatus is allowed.
 */
export function isValidTransition(currentStatus, newStatus) {
  const allowed = getNextValidStatuses(currentStatus);
  return allowed.includes(newStatus);
}

/**
 * Visual metadata for statuses (badge styles, labels, icons)
 */
export const STATUS_META = {
  [COMPLAINT_STATUSES.SUBMITTED]: {
    label: 'Submitted',
    stepNumber: 1,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
    description: 'Complaint lodged by student and queued for review.'
  },
  [COMPLAINT_STATUSES.UNDER_REVIEW]: {
    label: 'Under review',
    stepNumber: 2,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    description: 'Initial verification and department triage in progress.'
  },
  [COMPLAINT_STATUSES.ASSIGNED]: {
    label: 'Assigned',
    stepNumber: 3,
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    dot: 'bg-purple-500',
    description: 'Assigned to designated department authority officer.'
  },
  [COMPLAINT_STATUSES.IN_PROGRESS]: {
    label: 'In progress',
    stepNumber: 4,
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    dot: 'bg-indigo-500',
    description: 'Field inspection or remediation work underway.'
  },
  [COMPLAINT_STATUSES.NO_PROGRESS]: {
    label: 'No Progress',
    stepNumber: null,
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
    dot: 'bg-orange-500',
    description: 'No meaningful action taken yet; flagged for escalation.'
  },
  [COMPLAINT_STATUSES.ESCALATED]: {
    label: 'Escalated',
    stepNumber: null,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800 border-red-200',
    dot: 'bg-red-500',
    description: 'Escalated to senior authority for urgent action.'
  },
  [COMPLAINT_STATUSES.RESOLVED]: {
    label: 'Resolved',
    stepNumber: 5,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    description: 'Remediation completed and verified.'
  },
  [COMPLAINT_STATUSES.CLOSED]: {
    label: 'Closed',
    stepNumber: 6,
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
    description: 'Grievance closed after satisfactory resolution.'
  },
  [COMPLAINT_STATUSES.REOPENED]: {
    label: 'Reopened',
    stepNumber: null,
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-800 border-violet-200',
    dot: 'bg-violet-500',
    description: 'Student reopened grievance as issue persists.'
  },
  [COMPLAINT_STATUSES.REJECTED]: {
    label: 'Rejected',
    stepNumber: null,
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    dot: 'bg-rose-500',
    description: 'Declined due to invalid criteria or duplicate submission.'
  }
};

export const ORDERED_HAPPY_PATH = [
  COMPLAINT_STATUSES.SUBMITTED,
  COMPLAINT_STATUSES.UNDER_REVIEW,
  COMPLAINT_STATUSES.ASSIGNED,
  COMPLAINT_STATUSES.IN_PROGRESS,
  COMPLAINT_STATUSES.RESOLVED,
  COMPLAINT_STATUSES.CLOSED
];

/** Statuses that count as terminal (no further authority action needed) */
export const TERMINAL_STATUSES = [
  COMPLAINT_STATUSES.CLOSED,
  COMPLAINT_STATUSES.REJECTED
];

/** Statuses that indicate an open/active grievance */
export const ACTIVE_STATUSES = [
  COMPLAINT_STATUSES.SUBMITTED,
  COMPLAINT_STATUSES.UNDER_REVIEW,
  COMPLAINT_STATUSES.ASSIGNED,
  COMPLAINT_STATUSES.IN_PROGRESS,
  COMPLAINT_STATUSES.NO_PROGRESS,
  COMPLAINT_STATUSES.ESCALATED,
  COMPLAINT_STATUSES.REOPENED
];
