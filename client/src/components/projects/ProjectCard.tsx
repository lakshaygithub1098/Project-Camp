import { Link } from 'react-router-dom'
import { Users, ArrowUpRight } from 'lucide-react'
import { Card, RoleBadge } from '@/components/ui'
import { formatDate } from '@/lib/format'
import type { ProjectWithRole } from '@/types'

export function ProjectCard({ project, role }: ProjectWithRole) {
  return (
    <Card interactive className="group h-full">
      <Link to={`/projects/${project._id}`} className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-fg group-hover:text-brand">
            {project.name}
          </h3>
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-subtle transition-colors group-hover:text-brand"
            aria-hidden
          />
        </div>

        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">
          {project.description || 'No description provided.'}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Users className="h-3.5 w-3.5" aria-hidden />
            {project.members ?? 0} {project.members === 1 ? 'member' : 'members'}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-subtle">{formatDate(project.createdAt)}</span>
            <RoleBadge role={role} />
          </div>
        </div>
      </Link>
    </Card>
  )
}
