import { UserRole } from '@/types'

/**
 * Permission checks mirroring the PRD matrix. Centralised so a rule change
 * happens in one place instead of being scattered across components.
 *
 * Note: the backend enforces these too. These checks only decide what to show —
 * they are a UX affordance, never the security boundary.
 */
export const can = {
  manageProject: (role?: UserRole) => role === UserRole.ADMIN,
  manageMembers: (role?: UserRole) => role === UserRole.ADMIN,
  manageNotes: (role?: UserRole) => role === UserRole.ADMIN,

  manageTasks: (role?: UserRole) => role === UserRole.ADMIN || role === UserRole.PROJECT_ADMIN,
  manageSubtasks: (role?: UserRole) => role === UserRole.ADMIN || role === UserRole.PROJECT_ADMIN,

  /** Every project member may toggle subtask completion. */
  toggleSubtask: (role?: UserRole) => Boolean(role),
}
