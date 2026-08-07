import { Outlet, useParams } from 'react-router-dom'
import { useProject, useProjectRole } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { useMembers } from '@/hooks/useMembers'
import { PageHeader } from '@/components/common'
import { ErrorState, PageLoader, RoleBadge, Tabs } from '@/components/ui'
import type { TabItem } from '@/components/ui/Tabs'

/**
 * Shell for a single project. Loads the project once and exposes it, the
 * caller's role and the tab counts to nested routes via Outlet context.
 */
export interface ProjectOutletContext {
  projectId: string
  role: ReturnType<typeof useProjectRole>
}

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>()
  const projectQuery = useProject(projectId)
  const role = useProjectRole(projectId)

  // Counts drive the tab pills. Failures are non-fatal — the pill just hides.
  const { data: tasks } = useTasks(projectId)
  const { data: members } = useMembers(projectId)

  if (projectQuery.isLoading) return <PageLoader label="Loading project" />

  if (projectQuery.isError) {
    return (
      <ErrorState
        error={projectQuery.error}
        onRetry={() => void projectQuery.refetch()}
        title="Could not load this project"
      />
    )
  }

  const project = projectQuery.data
  if (!project || !projectId) return null

  const tabs: TabItem[] = [
    { label: 'Overview', to: '.', end: true },
    { label: 'Tasks', to: 'tasks', count: tasks?.length },
    { label: 'Members', to: 'members', count: members?.length },
    { label: 'Notes', to: 'notes' },
    { label: 'Settings', to: 'settings' },
  ]

  const context: ProjectOutletContext = { projectId, role }

  return (
    <>
      <PageHeader
        title={project.name}
        description={project.description || undefined}
        breadcrumbs={[{ label: 'Projects', to: '/projects' }, { label: project.name }]}
        action={role ? <RoleBadge role={role} /> : undefined}
      />

      <Tabs items={tabs} className="mb-6" />

      <Outlet context={context} />
    </>
  )
}
