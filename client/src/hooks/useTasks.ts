import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { taskService, type TaskPayload } from '@/services'
import { queryKeys } from '@/lib/query-keys'
import { normalizeApiError } from '@/lib/api-error'
import type { Task, TaskStatus } from '@/types'

export function useTasks(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tasks.list(projectId ?? ''),
    queryFn: () => taskService.list(projectId as string),
    enabled: Boolean(projectId),
  })
}

export function useTask(projectId: string | undefined, taskId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(projectId ?? '', taskId ?? ''),
    queryFn: () => taskService.getById(projectId as string, taskId as string),
    enabled: Boolean(projectId && taskId),
  })
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TaskPayload) => taskService.create(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list(projectId) })
      toast.success('Task created')
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  })
}

export function useUpdateTask(projectId: string, taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TaskPayload) => taskService.update(projectId, taskId, payload),
    onSuccess: (task) => {
      queryClient.setQueryData(queryKeys.tasks.detail(projectId, taskId), task)
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list(projectId) })
      toast.success('Task updated')
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  })
}

/**
 * Status changes are applied optimistically: the board reorders instantly and
 * rolls back if the server rejects the change. Safe because a status write is
 * idempotent and the only field touched.
 */
export function useUpdateTaskStatus(projectId: string) {
  const queryClient = useQueryClient()
  const listKey = queryKeys.tasks.list(projectId)

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      taskService.updateStatus(projectId, taskId, status),

    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: listKey })
      const previous = queryClient.getQueryData<Task[]>(listKey)

      queryClient.setQueryData<Task[]>(listKey, (tasks) =>
        tasks?.map((task) => (task._id === taskId ? { ...task, status } : task)),
      )

      return { previous }
    },

    onError: (error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(listKey, context.previous)
      toast.error(normalizeApiError(error).message)
    },

    onSettled: (_data, _error, { taskId }) => {
      void queryClient.invalidateQueries({ queryKey: listKey })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(projectId, taskId),
      })
    },
  })
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => taskService.remove(projectId, taskId),
    onSuccess: (_data, taskId) => {
      queryClient.removeQueries({ queryKey: queryKeys.tasks.detail(projectId, taskId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list(projectId) })
      toast.success('Task deleted')
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  })
}

export function useCreateSubtask(projectId: string, taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (title: string) => taskService.createSubtask(projectId, taskId, title),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(projectId, taskId),
      })
      toast.success('Subtask added')
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  })
}

/** Checking a subtask off is optimistic — it must feel instant. */
export function useUpdateSubtask(projectId: string, taskId: string) {
  const queryClient = useQueryClient()
  const detailKey = queryKeys.tasks.detail(projectId, taskId)

  return useMutation({
    mutationFn: ({
      subtaskId,
      ...payload
    }: {
      subtaskId: string
      title?: string
      isCompleted?: boolean
    }) => taskService.updateSubtask(projectId, subtaskId, payload),

    onMutate: async ({ subtaskId, title, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: detailKey })
      const previous = queryClient.getQueryData<Task>(detailKey)

      queryClient.setQueryData<Task>(detailKey, (task) =>
        task
          ? {
              ...task,
              subtasks: task.subtasks?.map((subtask) =>
                subtask._id === subtaskId
                  ? {
                      ...subtask,
                      ...(title !== undefined ? { title } : {}),
                      ...(isCompleted !== undefined ? { isCompleted } : {}),
                    }
                  : subtask,
              ),
            }
          : task,
      )

      return { previous }
    },

    onError: (error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(detailKey, context.previous)
      toast.error(normalizeApiError(error).message)
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: detailKey })
    },
  })
}

export function useDeleteSubtask(projectId: string, taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (subtaskId: string) => taskService.removeSubtask(projectId, subtaskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(projectId, taskId),
      })
      toast.success('Subtask removed')
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  })
}
