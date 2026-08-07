import { z } from 'zod'
import { TaskPriority, TaskStatus, UserRole } from '@/types'

/**
 * Mirrors the backend express-validator rules so users get instant feedback
 * that matches what the server will accept.
 */

const email = z.string().trim().min(1, 'Email is required').email('Enter a valid email address')

// The backend requires a non-empty password but sets no strength rules. We ask
// for 8 characters on new passwords to avoid trivially weak accounts, while
// login only requires non-empty so existing users are never locked out.
const newPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be 128 characters or fewer')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z
  .object({
    fullName: z.string().trim().max(80, 'Name must be 80 characters or fewer').optional(),
    // Backend rejects uppercase via isLowercase().
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be 30 characters or fewer')
      .regex(/^[a-z0-9_.-]+$/, 'Use lowercase letters, numbers, dots, hyphens or underscores'),
    email,
    password: newPassword,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z
  .object({
    newPassword,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
  .refine((values) => values.oldPassword !== values.newPassword, {
    path: ['newPassword'],
    message: 'New password must be different from the current one',
  })

export const profileSchema = z.object({
  fullName: z.string().trim().max(80, 'Name must be 80 characters or fewer').optional(),
  email,
})

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(80, 'Name must be 80 characters or fewer'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be 500 characters or fewer')
    .optional(),
})

export const inviteMemberSchema = z.object({
  email,
  role: z.nativeEnum(UserRole, { required_error: 'Select a role' }),
})

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title is required')
    .max(140, 'Title must be 140 characters or fewer'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description must be 2000 characters or fewer')
    .optional(),
  // Empty string is what a native <select> yields for "unassigned".
  assignedTo: z.string().optional(),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(TaskPriority),
  dueDate: z.string().optional(),
})

export const subtaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Subtask title is required')
    .max(140, 'Title must be 140 characters or fewer'),
})

export const noteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Note content is required')
    .max(5000, 'Note must be 5000 characters or fewer'),
})

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Write something first')
    .max(2000, 'Comment must be 2000 characters or fewer'),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
export type ProfileValues = z.infer<typeof profileSchema>
export type ProjectValues = z.infer<typeof projectSchema>
export type InviteMemberValues = z.infer<typeof inviteMemberSchema>
export type TaskValues = z.infer<typeof taskSchema>
export type SubtaskValues = z.infer<typeof subtaskSchema>
export type NoteValues = z.infer<typeof noteSchema>
export type CommentValues = z.infer<typeof commentSchema>
