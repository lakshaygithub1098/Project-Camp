import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, NotebookPen } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { useNotes } from '@/hooks/useNotes'
import { PageHeader } from '@/components/common'
import {
  Avatar,
  Card,
  CardBody,
  EmptyState,
  ErrorState,
  Select,
  SkeletonGrid,
} from '@/components/ui'
import { displayName, formatRelative } from '@/lib/format'

/**
 * Notes are stored per project and there is no cross-project endpoint, so this
 * page asks which project to read rather than silently fanning out.
 */
export default function Notes() {
  const projectsQuery = useProjects()
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data])
  const [projectId, setProjectId] = useState('')

  // Default to the first project once the list arrives.
  useEffect(() => {
    if (!projectId && projects.length > 0) {
      setProjectId(projects[0]!.project._id)
    }
  }, [projects, projectId])

  const notesQuery = useNotes(projectId || undefined)

  if (projectsQuery.isError) {
    return (
      <>
        <PageHeader title="Notes" />
        <ErrorState error={projectsQuery.error} onRetry={() => void projectsQuery.refetch()} />
      </>
    )
  }

  if (!projectsQuery.isLoading && projects.length === 0) {
    return (
      <>
        <PageHeader title="Notes" />
        <EmptyState
          icon={<FolderKanban className="h-5 w-5" aria-hidden />}
          title="No projects yet"
          description="Notes live inside projects. Create a project first."
          action={
            <Link
              to="/projects"
              className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-medium text-brand-fg transition-colors hover:bg-brand-hover"
            >
              Go to projects
            </Link>
          }
        />
      </>
    )
  }

  const notes = notesQuery.data ?? []

  return (
    <>
      <PageHeader
        title="Notes"
        description="Shared context and decisions, grouped by project."
        action={
          <Select
            aria-label="Select project"
            className="min-w-[12rem]"
            options={projects.map((row) => ({
              value: row.project._id,
              label: row.project.name,
            }))}
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
          />
        }
      />

      {notesQuery.isError ? (
        <ErrorState
          error={notesQuery.error}
          onRetry={() => void notesQuery.refetch()}
          title="Could not load notes"
        />
      ) : notesQuery.isLoading ? (
        <SkeletonGrid count={3} />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<NotebookPen className="h-5 w-5" aria-hidden />}
          title="No notes in this project"
          description="Open the project's Notes tab to add the first one."
          action={
            projectId ? (
              <Link
                to={`/projects/${projectId}/notes`}
                className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-medium text-brand-fg transition-colors hover:bg-brand-hover"
              >
                Open project notes
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <Card key={note._id} className="flex h-full flex-col">
              <CardBody className="flex-1">
                <p className="whitespace-pre-wrap text-sm text-fg">{note.content}</p>
              </CardBody>

              <div className="flex items-center gap-2 border-t border-border px-5 py-3">
                {typeof note.createdBy === 'object' && (
                  <Avatar
                    name={displayName(note.createdBy)}
                    src={note.createdBy.avatar?.url}
                    size="xs"
                  />
                )}
                <span className="min-w-0 truncate text-xs text-muted">
                  {typeof note.createdBy === 'object' ? displayName(note.createdBy) : 'Unknown'} ·{' '}
                  {formatRelative(note.updatedAt)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
