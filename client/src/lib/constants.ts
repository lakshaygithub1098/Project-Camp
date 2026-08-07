import { TaskStatus, UserRole, TaskPriority } from '@/types'

export const APP_NAME = 'ProjectCamp'

/**
 * Falls back to the hosted Render API. Set VITE_API_BASE_URL to
 * http://localhost:8000/api/v1 in client/.env to develop against a local backend.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://project-camp-server.onrender.com/api/v1'

/** localStorage keys, namespaced to avoid collisions on shared origins. */
export const STORAGE_KEYS = {
  accessToken: 'projectcamp.accessToken',
  refreshToken: 'projectcamp.refreshToken',
  theme: 'projectcamp.theme',
} as const

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'Todo',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.DONE]: 'Done',
}

export const TASK_STATUS_ORDER: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.DONE,
]

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Low',
  [TaskPriority.MEDIUM]: 'Medium',
  [TaskPriority.HIGH]: 'High',
}

export const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Admin',
  [UserRole.PROJECT_ADMIN]: 'Project Admin',
  [UserRole.MEMBER]: 'Member',
}

export const ROLE_DESCRIPTION: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Full access, including project settings and members.',
  [UserRole.PROJECT_ADMIN]: 'Can manage tasks and subtasks within the project.',
  [UserRole.MEMBER]: 'Can view the project and update subtask status.',
}

/** Select-ready option lists derived from the label maps above. */
export const TASK_STATUS_OPTIONS = TASK_STATUS_ORDER.map((status) => ({
  value: status,
  label: TASK_STATUS_LABEL[status],
}))

export const TASK_PRIORITY_OPTIONS = [
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH,
].map((priority) => ({ value: priority, label: TASK_PRIORITY_LABEL[priority] }))

export const ROLE_OPTIONS = [UserRole.ADMIN, UserRole.PROJECT_ADMIN, UserRole.MEMBER].map(
  (role) => ({ value: role, label: ROLE_LABEL[role] }),
)

/** Mirrors the backend multer config: images written to public/images. */
export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024
export const MAX_ATTACHMENTS = 5
