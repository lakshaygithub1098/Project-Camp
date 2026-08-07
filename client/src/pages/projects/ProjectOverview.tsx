import { Link } from 'react-router-dom'
import { CalendarDays, CheckCircle2, ListChecks, Users } from 'lucide-react'
import { useProjectContext } from '@/hooks/useProjectContext'
import { useProject } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { useMembers } from '@/hooks/useMembers'
import { StatCard } from '@/components/dashboard/StatCard'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  RoleBadge,
  Skeleton,
  StatusBadge,
} from '@/components/ui'
import { displayName, formatDate, formatRelative } from '@/lib/format'
import { TaskStatus } from '@/types'

export default function ProjectOverview() {
  const { projectId } = useProjectContext()
  const { data: project } = useProject(projectId)
  const { data: tasks, isLoading: tasksLoading, isError: tasksFailed } = useTasks(projectId)
  const { data: members, isLoading: membersLoading } = useMembers(projectId)

  const list = tasks ?? []
  const doneCount = list.filter((task) => task.status === TaskStatus.DONE).length
  const activeCount = list.filter((task) => task.status === TaskStatus.IN_PROGRESS).length

  const recent = [...list]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tasks" value={list.length} Icon={ListChecks} isLoading={tasksLoading} />
        <StatCard
          label="Completed"
          value={doneCount}
          Icon={CheckCircle2}
          tone="success"
          isLoading={tasksLoading}
        />
        <StatCard
          label="In progress"
          value={activeCount}
          Icon={ListChecks}
          tone="info"
          isLoading={tasksLoading}
        />
        <StatCard
          label="Members"
          value={members?.length ?? 0}
          Icon={Users}
          tone="warning"
          isLoading={membersLoading}
        />
      </div>

      {tasksFailed && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
          <p className="text-sm text-fg">
            Tasks could not be loaded for this project — the task endpoints are not available on the
            server yet.
          </p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent tasks" description="The five most recently updated" />

          {tasksLoading ? (
            <CardBody className="space-y-3">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-10" />
              ))}
            </CardBody>
          ) : recent.length === 0 ? (
            <CardBody>
              <p className="text-sm text-muted">
                No tasks yet.{' '}
                <Link to="tasks" className="font-medium text-brand hover:opacity-80">
                  Create the first one
                </Link>
                .
              </p>
            </CardBody>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((task) => (
                <li key={task._id}>
                  <Link
                    to={`/projects/${projectId}/tasks/${task._id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-elevated/60"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">{task.title}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        Updated {formatRelative(task.updatedAt)}
                      </p>
                    </div>
                    <StatusBadge status={task.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Progress" />
            <CardBody>
              <ProgressBar
                value={doneCount}
                total={list.length}
                label={`${doneCount} of ${list.length} complete`}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Details" />
            <CardBody className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>Created {formatDate(project?.createdAt)}</span>
              </div>
              <p className="text-muted">
                {project?.description || 'No description has been added to this project.'}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Team" />
            <CardBody>
              {membersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }, (_, index) => (
                    <Skeleton key={index} className="h-8" />
                  ))}
                </div>
              ) : members && members.length > 0 ? (
                <ul className="space-y-3">
                  {members.slice(0, 5).map((member) => (
                    <li key={member.user._id} className="flex items-center gap-3">
                      <Avatar
                        name={displayName(member.user)}
                        src={member.user.avatar?.url}
                        size="sm"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm text-fg">
                        {displayName(member.user)}
                      </span>
                      <RoleBadge role={member.role} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No members found.</p>
              )}

              {members && members.length > 5 && (
                <Link
                  to="members"
                  className="mt-4 inline-block text-xs font-medium text-brand hover:opacity-80"
                >
                  View all {members.length} members
                </Link>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
