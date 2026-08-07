import { request } from '@/lib/http'
import { endpoints } from './endpoints'
import type { Project, ProjectWithRole } from '@/types'

export interface ProjectPayload {
  name: string
  description?: string
}

export const projectService = {
  /** Returns each project paired with the caller's role in it. */
  list() {
    return request<ProjectWithRole[]>({ method: 'GET', url: endpoints.projects.list })
  },

  getById(projectId: string) {
    return request<Project>({ method: 'GET', url: endpoints.projects.detail(projectId) })
  },

  create(payload: ProjectPayload) {
    return request<Project>({
      method: 'POST',
      url: endpoints.projects.create,
      data: payload,
    })
  },

  update(projectId: string, payload: ProjectPayload) {
    return request<Project>({
      method: 'PUT',
      url: endpoints.projects.update(projectId),
      data: payload,
    })
  },

  remove(projectId: string) {
    return request<Project>({ method: 'DELETE', url: endpoints.projects.remove(projectId) })
  },
}
