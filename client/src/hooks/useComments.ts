import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { taskService } from '@/services'
import { queryKeys } from '@/lib/query-keys'
import { isNotFound, normalizeApiError } from '@/lib/api-error'

/**
 * Comments are in the product spec but have no backend model or route yet, so a
 * 404 here means "not built" rather than "failed". The query treats that as an
 * empty list and the UI shows an unavailable notice instead of an error.
 */
export function useComments(projectId: string | undefined, taskId: string | undefined) {
  const query = useQuery({
    queryKey: queryKeys.tasks.comments(projectId ?? '', taskId ?? ''),
    queryFn: () => taskService.listComments(projectId as string, taskId as string),
    enabled: Boolean(projectId && taskId),
    retry: false,
  })

  return {
    ...query,
    /** True when the endpoint is absent, so the UI can explain itself. */
    isUnavailable: isNotFound(query.error),
    comments: query.data ?? [],
  }
}

export function useCreateComment(projectId: string, taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => taskService.createComment(projectId, taskId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.comments(projectId, taskId),
      })
    },
    onError: (error) => {
      toast.error(
        isNotFound(error)
          ? 'Comments are not available yet on this server.'
          : normalizeApiError(error).message,
      )
    },
  })
}

export function useDeleteComment(projectId: string, taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => taskService.removeComment(projectId, taskId, commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.comments(projectId, taskId),
      })
      toast.success('Comment deleted')
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  })
}
