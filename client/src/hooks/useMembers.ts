import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { memberService } from '@/services'
import { queryKeys } from '@/lib/query-keys'
import { normalizeApiError } from '@/lib/api-error'
import { ROLE_LABEL } from '@/lib/constants'
import type { ProjectMember, UserRole } from '@/types'

export function useMembers(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.members.list(projectId ?? ''),
    queryFn: () => memberService.list(projectId as string),
    enabled: Boolean(projectId),
    select: (rows: ProjectMember[]) => rows.filter((row) => Boolean(row?.user?._id)),
  })
}

export function useAddMember(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { email: string; role: UserRole }) =>
      memberService.add(projectId, payload),
    onSuccess: (_data, payload) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.members.list(projectId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() })
      toast.success(`${payload.email} added as ${ROLE_LABEL[payload.role]}`)
    },
    onError: (error) => {
      const { status, message } = normalizeApiError(error)
      // The backend looks the invitee up by email and 404s if they have no
      // account, which is worth saying plainly.
      toast.error(
        status === 404 ? 'No account found with that email. Ask them to register first.' : message,
      )
    },
  })
}

export function useUpdateMemberRole(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      memberService.updateRole(projectId, userId, role),
    onSuccess: (_data, { role }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.members.list(projectId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() })
      toast.success(`Role updated to ${ROLE_LABEL[role]}`)
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  })
}

export function useRemoveMember(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => memberService.remove(projectId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.members.list(projectId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() })
      toast.success('Member removed')
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  })
}
