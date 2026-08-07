import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { noteService } from '@/services'
import { queryKeys } from '@/lib/query-keys'
import { normalizeApiError } from '@/lib/api-error'

export function useNotes(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.notes.list(projectId ?? ''),
    queryFn: () => noteService.list(projectId as string),
    enabled: Boolean(projectId),
  })
}

export function useCreateNote(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => noteService.create(projectId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.list(projectId) })
      toast.success('Note added')
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  })
}

export function useUpdateNote(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      noteService.update(projectId, noteId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.list(projectId) })
      toast.success('Note updated')
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  })
}

export function useDeleteNote(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (noteId: string) => noteService.remove(projectId, noteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.list(projectId) })
      toast.success('Note deleted')
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  })
}
