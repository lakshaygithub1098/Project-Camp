import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock, Paperclip, Pencil, Trash2 } from 'lucide-react'
import {
  useCreateSubtask,
  useDeleteSubtask,
  useDeleteTask,
  useTask,
  useUpdateSubtask,
  useUpdateTask,
} from '@/hooks/useTasks'
import { useProject, useProjectRole } from '@/hooks/useProjects'
import { can } from '@/lib/permissions'
import { PageHeader } from '@/components/common'
import { TaskFormModal } from '@/components/tasks/TaskFormModal'
import { SubtaskList } from '@/components/tasks/SubtaskList'
import { AttachmentList } from '@/components/tasks/AttachmentList'
import { CommentList } from '@/components/tasks/CommentList'
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  ErrorState,
  PageLoader,
  PriorityBadge,
  StatusBadge,
} from '@/components/ui'
import { displayName, formatDate, formatDateTime, isOverdue } from '@/lib/format'
import { cn } from '@/lib/cn'
import { TaskStatus } from '@/types'

export default function TaskDetails() {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>()
  const navigate = useNavigate()

  const taskQuery = useTask(projectId, taskId)
  const { data: project } = useProject(projectId)
  const role = useProjectRole(projectId)

  const updateTask = useUpdateTask(projectId ?? '', taskId ?? '')
  const deleteTask = useDeleteTask(projectId ?? '')
  const createSubtask = useCreateSubtask(projectId ?? '', taskId ?? '')
  const updateSubtask = useUpdateSubtask(projectId ?? '', taskId ?? '')
  const deleteSubtask = useDeleteSubtask(projectId ?? '', taskId ?? '')

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  if (taskQuery.isLoading) return <PageLoader label="Loading task" />

  if (taskQuery.isError) {
    return (
      <ErrorState
        error={taskQuery.error}
        onRetry={() => void taskQuery.refetch()}
        title="Could not load this task"
      />
    )
  }

  const task = taskQuery.data
  if (!task || !projectId || !taskId) return null

  const canManage = can.manageTasks(role)
  const overdue = isOverdue(task.dueDate) && task.status !== TaskStatus.DONE

  const handleDelete = async () => {
    await deleteTask.mutateAsync(taskId)
    setIsDeleteOpen(false)
    navigate(`/projects/${projectId}/tasks`, { replace: true })
  }

  return (
    <>
      <Link
        to={`/projects/${projectId}/tasks`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to tasks
      </Link>

      <PageHeader
        title={task.title}
        breadcrumbs={[
          { label: 'Projects', to: '/projects' },
          { label: project?.name ?? 'Project', to: `/projects/${projectId}` },
          { label: 'Tasks', to: `/projects/${projectId}/tasks` },
          { label: task.title },
        ]}
        action={
          canManage ? (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                leftIcon={<Pencil className="h-4 w-4" aria-hidden />}
                onClick={() => setIsEditOpen(true)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                className="text-danger hover:bg-danger/10"
                leftIcon={<Trash2 className="h-4 w-4" aria-hidden />}
                onClick={() => setIsDeleteOpen(true)}
              >
                Delete
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader title="Description" />
            <CardBody>
              {task.description ? (
                <p className="whitespace-pre-wrap text-sm text-fg">{task.description}</p>
              ) : (
                <p className="text-sm text-subtle">No description was added to this task.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Subtasks"
              description="Break the work down into checkable steps."
            />
            <CardBody>
              <SubtaskList
                subtasks={task.subtasks ?? []}
                canManage={can.manageSubtasks(role)}
                canToggle={can.toggleSubtask(role)}
                onToggle={(subtaskId, isCompleted) =>
                  updateSubtask.mutate({ subtaskId, isCompleted })
                }
                onCreate={(title) => createSubtask.mutateAsync(title)}
                onDelete={(subtaskId) => deleteSubtask.mutate(subtaskId)}
                isCreating={createSubtask.isPending}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Comments" />
            <CardBody>
              <CommentList projectId={projectId} taskId={taskId} />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Details" />
            <CardBody>
              <dl className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Status</dt>
                  <dd>
                    <StatusBadge status={task.status} />
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Priority</dt>
                  <dd>
                    {task.priority ? (
                      <PriorityBadge priority={task.priority} />
                    ) : (
                      <span className="text-xs text-subtle">Not set</span>
                    )}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Assignee</dt>
                  <dd>
                    {task.assignedTo ? (
                      <span className="inline-flex items-center gap-2">
                        <Avatar
                          name={displayName(task.assignedTo)}
                          src={task.assignedTo.avatar?.url}
                          size="xs"
                        />
                        <span className="text-fg">{displayName(task.assignedTo)}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-subtle">Unassigned</span>
                    )}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Due date</dt>
                  <dd
                    className={cn(
                      'inline-flex items-center gap-1.5',
                      overdue ? 'font-medium text-danger' : 'text-fg',
                    )}
                  >
                    {task.dueDate ? (
                      <>
                        <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                        {formatDate(task.dueDate)}
                      </>
                    ) : (
                      <span className="text-xs text-subtle">Not set</span>
                    )}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                  <dt className="text-muted">Created</dt>
                  <dd className="text-xs text-muted">{formatDateTime(task.createdAt)}</dd>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Updated</dt>
                  <dd className="text-xs text-muted">{formatDateTime(task.updatedAt)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <Paperclip className="h-3.5 w-3.5" aria-hidden />
                  Attachments
                </span>
              }
            />
            <CardBody>
              <AttachmentList attachments={task.attachments ?? []} />
            </CardBody>
          </Card>
        </div>
      </div>

      <TaskFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={(values) => updateTask.mutateAsync(values)}
        projectId={projectId}
        task={task}
        isSubmitting={updateTask.isPending}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
        title="Delete task"
        message={`“${task.title}” and its subtasks will be permanently removed. This cannot be undone.`}
        isLoading={deleteTask.isPending}
      />
    </>
  )
}
