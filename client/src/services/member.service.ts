import { request } from '@/lib/http'
import { endpoints } from './endpoints'
import type { ProjectMember, UserRole } from '@/types'

export const memberService = {
  list(projectId: string) {
    return request<ProjectMember[]>({
      method: 'GET',
      url: endpoints.projects.members(projectId),
    })
  },

  /** Invites by email; the user must already have an account. */
  add(projectId: string, payload: { email: string; role: UserRole }) {
    return request<Record<string, never>>({
      method: 'POST',
      url: endpoints.projects.addMember(projectId),
      data: payload,
    })
  },

  /** The backend reads this from `newRole`, not `role`. */
  updateRole(projectId: string, userId: string, newRole: UserRole) {
    return request<ProjectMember>({
      method: 'PUT',
      url: endpoints.projects.member(projectId, userId),
      data: { newRole },
    })
  },

  remove(projectId: string, userId: string) {
    return request<ProjectMember>({
      method: 'DELETE',
      url: endpoints.projects.member(projectId, userId),
    })
  },
}
