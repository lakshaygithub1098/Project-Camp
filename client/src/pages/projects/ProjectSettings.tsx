import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Lock } from 'lucide-react'
import { useProjectContext } from '@/hooks/useProjectContext'
import { useDeleteProject, useProject, useUpdateProject } from '@/hooks/useProjects'
import { can } from '@/lib/permissions'
import { ProjectFormModal } from '@/components/projects/ProjectFormModal'
import { Button, Card, CardBody, CardHeader, ConfirmDialog, EmptyState } from '@/components/ui'
import { formatDateTime } from '@/lib/format'

export default function ProjectSettings() {
  const { projectId, role } = useProjectContext()
  const { data: project } = useProject(projectId)
  const navigate = useNavigate()

  const updateProject = useUpdateProject(projectId)
  const deleteProject = useDeleteProject()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  if (!can.manageProject(role)) {
    return (
      <EmptyState
        icon={<Lock className="h-5 w-5" aria-hidden />}
        title="Admins only"
        description="Only project admins can change project settings. Ask an admin if you need something updated here."
      />
    )
  }

  const handleDelete = async () => {
    await deleteProject.mutateAsync(projectId)
    setIsDeleteOpen(false)
    navigate('/projects', { replace: true })
  }

  return (
    <div className="max-w-3xl space-y-5">
      <Card>
        <CardHeader
          title="Project details"
          description="The name and description shown to everyone with access."
          action={
            <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(true)}>
              Edit
            </Button>
          }
        />

        <CardBody>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">Name</dt>
              <dd className="mt-1 text-sm text-fg">{project?.name}</dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">Created</dt>
              <dd className="mt-1 text-sm text-fg">{formatDateTime(project?.createdAt)}</dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">Description</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-fg">
                {project?.description || (
                  <span className="text-subtle">No description provided.</span>
                )}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      <Card className="border-danger/30">
        <CardHeader
          title={
            <span className="inline-flex items-center gap-2 text-danger">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              Danger zone
            </span>
          }
          description="Irreversible actions. Please be certain."
        />

        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-fg">Delete this project</p>
            <p className="mt-0.5 text-sm text-muted">
              Removes the project along with its tasks, notes and member assignments.
            </p>
          </div>

          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            Delete project
          </Button>
        </CardBody>
      </Card>

      <ProjectFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={(values) => updateProject.mutateAsync(values)}
        project={project}
        isSubmitting={updateProject.isPending}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
        title="Delete project"
        message={`“${project?.name}” and everything inside it will be permanently deleted. This cannot be undone.`}
        isLoading={deleteProject.isPending}
      />
    </div>
  )
}
