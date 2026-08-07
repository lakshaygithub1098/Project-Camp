import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { projectService, type ProjectPayload } from '@/services'
import { queryKeys } from '@/lib/query-keys'
import { normalizeApiError } from '@/lib/api-error'
import type { ProjectWithRole, UserRole } from '@/types'

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: () => projectService.list(),
    // The aggregation can return entries without a joined project document;
    // filter those out so the UI never renders an empty card.
    select: (rows: ProjectWithRole[]) => rows.filter((row) => Boolean(row?.project?._id)),
  })
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId ?? ''),
    queryFn: () => projectService.getById(projectId as string),
    enabled: Boolean(projectId),
  })
}

/** The caller's role in a project, read from the list response. */
export function useProjectRole(projectId: string | undefined): UserRole | undefined {
  const { data } = useProjects()
  if (!projectId) return undefined
  return data?.find((row) => row.project._id === projectId)?.role
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ProjectPayload) => projectService.create(payload),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      toast.success(`Project “${project.name}” created`)
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  })
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ProjectPayload) => projectService.update(projectId, payload),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(projectId), project)
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() })
      toast.success('Project updated')
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) => projectService.remove(projectId),
    onSuccess: (_data, projectId) => {
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(projectId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() })
      toast.success('Project deleted')
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  })
}
