import { request } from '@/lib/http'
import { endpoints } from './endpoints'
import type { Note } from '@/types'

export const noteService = {
  list(projectId: string) {
    return request<Note[]>({ method: 'GET', url: endpoints.notes.list(projectId) })
  },

  getById(projectId: string, noteId: string) {
    return request<Note>({ method: 'GET', url: endpoints.notes.detail(projectId, noteId) })
  },

  create(projectId: string, content: string) {
    return request<Note>({
      method: 'POST',
      url: endpoints.notes.create(projectId),
      data: { content },
    })
  },

  update(projectId: string, noteId: string, content: string) {
    return request<Note>({
      method: 'PUT',
      url: endpoints.notes.update(projectId, noteId),
      data: { content },
    })
  },

  remove(projectId: string, noteId: string) {
    return request<Note>({ method: 'DELETE', url: endpoints.notes.remove(projectId, noteId) })
  },
}
