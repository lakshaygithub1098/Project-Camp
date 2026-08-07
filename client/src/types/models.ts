/** Mongo documents are serialized with `_id`, not `id`. */
export interface MongoDoc {
  _id: string
  createdAt: string
  updatedAt: string
}

export const UserRole = {
  ADMIN: 'admin',
  PROJECT_ADMIN: 'project_admin',
  MEMBER: 'member',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

/**
 * Priority is part of the product spec but not yet part of the backend Task
 * schema. The frontend sends and reads it so the feature works the moment the
 * schema catches up; until then it round-trips as undefined.
 */
export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority]

export interface Avatar {
  url: string
  localPath?: string
}

export interface User extends MongoDoc {
  username: string
  email: string
  fullName?: string
  avatar?: Avatar
  isEmailVerified: boolean
}

/**
 * Reduced user shape returned by aggregation pipelines that project only
 * display fields. Note the backend's member projection omits `email`.
 */
export interface UserSummary {
  _id: string
  username: string
  fullName?: string
  email?: string
  avatar?: Avatar
}

export interface Project extends MongoDoc {
  name: string
  description?: string
  createdBy: string
  /** Member count, present on list responses via aggregation. */
  members?: number
}

/** `GET /projects` returns the project plus the caller's role in it. */
export interface ProjectWithRole {
  project: Project
  role: UserRole
}

export interface ProjectMember {
  _id?: string
  project: string
  user: UserSummary
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  _id?: string
  url: string
  mimetype?: string
  size?: number
}

export interface Subtask extends MongoDoc {
  title: string
  task: string
  isCompleted: boolean
  createdBy: UserSummary | string
}

export interface Task extends MongoDoc {
  title: string
  description?: string
  project: string
  assignedTo?: UserSummary | null
  assignedBy?: UserSummary | string
  status: TaskStatus
  attachments: Attachment[]
  /** Populated by the task-detail aggregation. */
  subtasks?: Subtask[]
  /** Spec fields not yet in the backend schema. See TaskPriority. */
  priority?: TaskPriority
  dueDate?: string | null
}

export interface Note extends MongoDoc {
  project: string
  content: string
  createdBy: UserSummary | string
}

export interface Comment extends MongoDoc {
  task: string
  content: string
  createdBy: UserSummary | string
}
