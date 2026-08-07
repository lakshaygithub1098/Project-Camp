/**
 * Central query-key factory. Keeping keys here means an invalidation never has
 * to guess at the array another file used.
 */
export const queryKeys = {
  currentUser: ['current-user'] as const,

  projects: {
    all: ['projects'] as const,
    list: () => [...queryKeys.projects.all, 'list'] as const,
    detail: (projectId: string) => [...queryKeys.projects.all, 'detail', projectId] as const,
  },

  members: {
    all: ['members'] as const,
    list: (projectId: string) => [...queryKeys.members.all, 'list', projectId] as const,
  },

  tasks: {
    all: ['tasks'] as const,
    list: (projectId: string) => [...queryKeys.tasks.all, 'list', projectId] as const,
    detail: (projectId: string, taskId: string) =>
      [...queryKeys.tasks.all, 'detail', projectId, taskId] as const,
    comments: (projectId: string, taskId: string) =>
      [...queryKeys.tasks.all, 'comments', projectId, taskId] as const,
  },

  notes: {
    all: ['notes'] as const,
    list: (projectId: string) => [...queryKeys.notes.all, 'list', projectId] as const,
  },
} as const
