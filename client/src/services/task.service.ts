import { request } from '@/lib/http'
import { endpoints } from './endpoints'
import type { Comment, Subtask, Task, TaskPriority, TaskStatus } from '@/types'

export interface TaskPayload {
  title: string
  description?: string
  assignedTo?: string
  status?: TaskStatus
  /** Not yet persisted by the backend schema. */
  priority?: TaskPriority
  dueDate?: string | null
  /** New files to upload alongside the task fields. */
  attachments?: File[]
}

/**
 * Tasks are sent as multipart because the backend reads attachments via multer.
 * multer only parses multipart bodies, so a JSON request would leave req.body
 * empty on the create/update routes.
 */
function toFormData(payload: TaskPayload): FormData {
  const form = new FormData()
  form.append('title', payload.title)
  if (payload.description !== undefined) form.append('description', payload.description)
  if (payload.assignedTo) form.append('assignedTo', payload.assignedTo)
  if (payload.status) form.append('status', payload.status)
  if (payload.priority) form.append('priority', payload.priority)
  if (payload.dueDate) form.append('dueDate', payload.dueDate)

  for (const file of payload.attachments ?? []) {
    form.append('attachments', file)
  }

  return form
}

export const taskService = {
  list(projectId: string) {
    return request<Task[]>({ method: 'GET', url: endpoints.tasks.list(projectId) })
  },

  getById(projectId: string, taskId: string) {
    return request<Task>({ method: 'GET', url: endpoints.tasks.detail(projectId, taskId) })
  },

  create(projectId: string, payload: TaskPayload) {
    return request<Task>({
      method: 'POST',
      url: endpoints.tasks.create(projectId),
      data: toFormData(payload),
    })
  },

  update(projectId: string, taskId: string, payload: TaskPayload) {
    return request<Task>({
      method: 'PUT',
      url: endpoints.tasks.update(projectId, taskId),
      data: toFormData(payload),
    })
  },

  /** Status-only change, used by the board's quick actions. */
  updateStatus(projectId: string, taskId: string, status: TaskStatus) {
    return request<Task>({
      method: 'PUT',
      url: endpoints.tasks.update(projectId, taskId),
      data: (() => {
        const form = new FormData()
        form.append('status', status)
        return form
      })(),
    })
  },

  remove(projectId: string, taskId: string) {
    return request<Task>({ method: 'DELETE', url: endpoints.tasks.remove(projectId, taskId) })
  },

  createSubtask(projectId: string, taskId: string, title: string) {
    return request<Subtask>({
      method: 'POST',
      url: endpoints.tasks.createSubtask(projectId, taskId),
      data: { title },
    })
  },

  updateSubtask(
    projectId: string,
    subtaskId: string,
    payload: { title?: string; isCompleted?: boolean },
  ) {
    return request<Subtask>({
      method: 'PUT',
      url: endpoints.tasks.updateSubtask(projectId, subtaskId),
      data: payload,
    })
  },

  removeSubtask(projectId: string, subtaskId: string) {
    return request<Subtask>({
      method: 'DELETE',
      url: endpoints.tasks.removeSubtask(projectId, subtaskId),
    })
  },

  listComments(projectId: string, taskId: string) {
    return request<Comment[]>({
      method: 'GET',
      url: endpoints.tasks.comments(projectId, taskId),
    })
  },

  createComment(projectId: string, taskId: string, content: string) {
    return request<Comment>({
      method: 'POST',
      url: endpoints.tasks.comments(projectId, taskId),
      data: { content },
    })
  },

  removeComment(projectId: string, taskId: string, commentId: string) {
    return request<Comment>({
      method: 'DELETE',
      url: endpoints.tasks.comment(projectId, taskId, commentId),
    })
  },
}
