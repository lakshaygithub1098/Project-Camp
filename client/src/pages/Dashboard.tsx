import { Link } from 'react-router-dom'
import {
  CircleDashed,
  FolderKanban,
  ListChecks,
  Plus,
  Clock,
  Activity,
  CheckCircle2,
} from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { useAllTasks } from '@/hooks/useAllTasks'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/common'
import { StatCard } from '@/components/dashboard/StatCard'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  SkeletonList,
  StatusBadge,
  Button,
} from '@/components/ui'
import { displayName, formatDate, formatRelative } from '@/lib/format'
import { TaskStatus } from '@/types'
import type { Task } from '@/types'

/** Sorts by most recent activity, newest first. */
function byRecency(a: Task, b: Task) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
}

export default function Dashboard() {
  const { user } = useAuth()
  const projectsQuery = useProjects()
  const projects = projectsQuery.data
  const { tasks, isLoading: tasksLoading, isEntirelyUnavailable } = useAllTasks(projects)

  const doneCount = tasks.filter((task) => task.status === TaskStatus.DONE).length
  const inProgressCount = tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length
  const pendingCount = tasks.length - doneCount

  const recentTasks = [...tasks].sort(byRecency).slice(0, 6)

  // Upcoming deadlines rely on dueDate, which the backend does not store yet;
  // the panel explains itself rather than rendering an empty box.
  const upcoming = tasks
    .filter((task) => task.dueDate && task.status !== TaskStatus.DONE)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)

  if (projectsQuery.isError) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <ErrorState error={projectsQuery.error} onRetry={() => void projectsQuery.refetch()} />
      </>
    )
  }

  const statsLoading = projectsQuery.isLoading || tasksLoading

  return (
    <>
      <PageHeader
        title={`Welcome back${user ? `, ${displayName(user).split(' ')[0]}` : ''}`}
        description="A snapshot of everything you're part of right now."
        action={
          <Link to="/projects">
            <Button leftIcon={<Plus className="h-4 w-4" aria-hidden />}>New project</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Projects"
          value={projects?.length ?? 0}
          Icon={FolderKanban}
          isLoading={projectsQuery.isLoading}
        />
        <StatCard
          label="Total tasks"
          value={tasks.length}
          Icon={ListChecks}
          tone="info"
          isLoading={statsLoading}
        />
        <StatCard
          label="Completed"
          value={doneCount}
          Icon={CheckCircle2}
          tone="success"
          hint={tasks.length > 0 ? `${Math.round((doneCount / tasks.length) * 100)}% done` : undefined}
          isLoading={statsLoading}
        />
        <StatCard
          label="Pending"
          value={pendingCount}
          Icon={CircleDashed}
          tone="warning"
          hint={inProgressCount > 0 ? `${inProgressCount} in progress` : undefined}
          isLoading={statsLoading}
        />
      </div>

      {isEntirelyUnavailable && (
        <div className="mt-6 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
          <p className="text-sm text-fg">
            Task data could not be loaded. The task endpoints are not available on the server yet,
            so task counts show as zero.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent activity"
            description="Tasks updated most recently across your projects"
          />

          {statsLoading ? (
            <CardBody>
              <SkeletonList rows={4} />
            </CardBody>
          ) : recentTasks.length === 0 ? (
            <CardBody>
              <EmptyState
                icon={<Activity className="h-5 w-5" aria-hidden />}
                title="No activity yet"
                description="Once tasks are created and updated, they'll show up here."
              />
            </CardBody>
          ) : (
            <ul className="divide-y divide-border">
              {recentTasks.map((task) => (
                <li key={task._id}>
                  <Link
                    to={`/projects/${task.project}/tasks/${task._id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-elevated/60"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">{task.title}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        Updated {formatRelative(task.updatedAt)}
                        {task.assignedTo && ` · ${displayName(task.assignedTo)}`}
                      </p>
                    </div>
                    <StatusBadge status={task.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Side column */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="Completion" />
            <CardBody className="space-y-4">
              <ProgressBar
                value={doneCount}
                total={tasks.length}
                label={`${doneCount} of ${tasks.length} tasks`}
              />

              <dl className="grid grid-cols-3 gap-2 pt-1 text-center">
                {[
                  { label: 'To do', value: tasks.length - doneCount - inProgressCount },
                  { label: 'Active', value: inProgressCount },
                  { label: 'Done', value: doneCount },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-elevated px-2 py-2.5">
                    <dt className="text-xs text-muted">{item.label}</dt>
                    <dd className="mt-0.5 text-base font-semibold text-fg">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Upcoming deadlines" />
            <CardBody>
              {upcoming.length > 0 ? (
                <ul className="space-y-3">
                  {upcoming.map((task) => (
                    <li key={task._id}>
                      <Link
                        to={`/projects/${task.project}/tasks/${task._id}`}
                        className="flex items-start gap-2.5 text-sm transition-colors hover:text-brand"
                      >
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-fg">{task.title}</span>
                          <span className="text-xs text-muted">{formatDate(task.dueDate)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">
                  No upcoming deadlines.{' '}
                  <span className="text-subtle">
                    Due dates are stored once the backend adds the field.
                  </span>
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {projects?.length === 0 && !projectsQuery.isLoading && (
        <EmptyState
          className="mt-6"
          icon={<FolderKanban className="h-5 w-5" aria-hidden />}
          title="No projects yet"
          description="Create your first project to start tracking tasks and inviting teammates."
          action={
            <Link to="/projects">
              <Button leftIcon={<Plus className="h-4 w-4" aria-hidden />}>Create a project</Button>
            </Link>
          }
        />
      )}
    </>
  )
}
