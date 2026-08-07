import { useQueries } from '@tanstack/react-query'
import { taskService } from '@/services'
import { queryKeys } from '@/lib/query-keys'
import type { ProjectWithRole, Task } from '@/types'

export interface ProjectTasks {
  project: ProjectWithRole['project']
  role: ProjectWithRole['role']
  tasks: Task[]
}

/**
 * Fans out one task query per project so the dashboard can aggregate totals.
 * The backend has no cross-project task endpoint, so this is done client-side.
 *
 * Individual failures are tolerated: a project whose tasks cannot load simply
 * contributes nothing rather than breaking the whole dashboard.
 */
export function useAllTasks(projects: ProjectWithRole[] | undefined) {
  const rows = projects ?? []

  const queries = useQueries({
    queries: rows.map((row) => ({
      queryKey: queryKeys.tasks.list(row.project._id),
      queryFn: () => taskService.list(row.project._id),
      staleTime: 30_000,
      retry: false,
    })),
  })

  const isLoading = queries.some((query) => query.isLoading)
  const failedCount = queries.filter((query) => query.isError).length

  const byProject: ProjectTasks[] = rows.map((row, index) => ({
    project: row.project,
    role: row.role,
    tasks: queries[index]?.data ?? [],
  }))

  const tasks = byProject.flatMap((entry) => entry.tasks)

  return {
    tasks,
    byProject,
    isLoading,
    /** True when every project's task query failed, e.g. route not mounted. */
    isEntirelyUnavailable: rows.length > 0 && failedCount === rows.length,
    failedCount,
  }
}
