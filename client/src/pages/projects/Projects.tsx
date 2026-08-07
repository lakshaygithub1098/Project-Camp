import { useMemo, useState } from 'react'
import { FolderKanban, Plus, Search } from 'lucide-react'
import { useCreateProject, useProjects } from '@/hooks/useProjects'
import { PageHeader } from '@/components/common'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectFormModal } from '@/components/projects/ProjectFormModal'
import { Button, EmptyState, ErrorState, Input, SkeletonGrid } from '@/components/ui'

export default function Projects() {
  const { data: projects, isLoading, isError, error, refetch } = useProjects()
  const createProject = useCreateProject()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!projects) return []
    const term = search.trim().toLowerCase()
    if (!term) return projects

    return projects.filter(
      ({ project }) =>
        project.name.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term),
    )
  }, [projects, search])

  const newProjectButton = (
    <Button
      leftIcon={<Plus className="h-4 w-4" aria-hidden />}
      onClick={() => setIsFormOpen(true)}
    >
      New project
    </Button>
  )

  return (
    <>
      <PageHeader
        title="Projects"
        description="Everything you're a member of, newest activity first."
        action={newProjectButton}
      />

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <SkeletonGrid />
      ) : projects && projects.length > 0 ? (
        <>
          <div className="mb-5 max-w-sm">
            <Input
              type="search"
              placeholder="Search projects…"
              aria-label="Search projects"
              leftIcon={<Search className="h-4 w-4" aria-hidden />}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {filtered.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((row) => (
                <ProjectCard key={row.project._id} project={row.project} role={row.role} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Search className="h-5 w-5" aria-hidden />}
              title="No matching projects"
              description={`Nothing matched “${search}”. Try a different search.`}
              action={
                <Button variant="secondary" onClick={() => setSearch('')}>
                  Clear search
                </Button>
              }
            />
          )}
        </>
      ) : (
        <EmptyState
          icon={<FolderKanban className="h-5 w-5" aria-hidden />}
          title="No projects yet"
          description="Create your first project to organise tasks, notes and teammates in one place."
          action={newProjectButton}
        />
      )}

      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={(values) => createProject.mutateAsync(values)}
        isSubmitting={createProject.isPending}
      />
    </>
  )
}
