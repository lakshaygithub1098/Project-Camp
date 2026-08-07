import { useQueries } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { memberService } from '@/services'
import { queryKeys } from '@/lib/query-keys'
import { PageHeader } from '@/components/common'
import {
  Avatar,
  Badge,
  EmptyState,
  ErrorState,
  RoleBadge,
  SkeletonList,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { displayName } from '@/lib/format'
import type { ProjectMember, UserRole } from '@/types'

interface AggregatedMember {
  user: ProjectMember['user']
  /** Every project this person shares with you, and their role in each. */
  memberships: { projectId: string; projectName: string; role: UserRole }[]
}

/**
 * People view across all projects. The backend has no global members endpoint,
 * so this aggregates per-project member lists client-side.
 */
export default function Members() {
  const projectsQuery = useProjects()
  const projects = projectsQuery.data ?? []

  const memberQueries = useQueries({
    queries: projects.map((row) => ({
      queryKey: queryKeys.members.list(row.project._id),
      queryFn: () => memberService.list(row.project._id),
      staleTime: 30_000,
      retry: false,
    })),
  })

  const isLoading = projectsQuery.isLoading || memberQueries.some((query) => query.isLoading)

  // Merge per-project rows into one entry per person.
  const byUser = new Map<string, AggregatedMember>()

  memberQueries.forEach((query, index) => {
    const project = projects[index]?.project
    if (!project || !query.data) return

    for (const member of query.data) {
      if (!member?.user?._id) continue

      const existing = byUser.get(member.user._id)
      const membership = {
        projectId: project._id,
        projectName: project.name,
        role: member.role,
      }

      if (existing) {
        existing.memberships.push(membership)
      } else {
        byUser.set(member.user._id, { user: member.user, memberships: [membership] })
      }
    }
  })

  const people = [...byUser.values()].sort((a, b) =>
    displayName(a.user).localeCompare(displayName(b.user)),
  )

  if (projectsQuery.isError) {
    return (
      <>
        <PageHeader title="Members" />
        <ErrorState error={projectsQuery.error} onRetry={() => void projectsQuery.refetch()} />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Members"
        description="Everyone you share a project with, and their role in each."
      />

      {isLoading ? (
        <SkeletonList rows={5} />
      ) : people.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" aria-hidden />}
          title="No teammates yet"
          description="Once you add members to a project, they'll be listed here."
          action={
            <Link
              to="/projects"
              className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-medium text-brand-fg transition-colors hover:bg-brand-hover"
            >
              Go to projects
            </Link>
          }
        />
      ) : (
        <Table>
          <THead>
            <TH>Person</TH>
            <TH className="hidden sm:table-cell">Username</TH>
            <TH>Projects</TH>
          </THead>

          <TBody>
            {people.map(({ user, memberships }) => (
              <TR key={user._id}>
                <TD>
                  <div className="flex items-center gap-3">
                    <Avatar name={displayName(user)} src={user.avatar?.url} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-fg">{displayName(user)}</p>
                      <p className="truncate text-xs text-muted sm:hidden">@{user.username}</p>
                    </div>
                  </div>
                </TD>

                <TD className="hidden text-sm text-muted sm:table-cell">@{user.username}</TD>

                <TD>
                  <div className="flex flex-wrap gap-1.5">
                    {memberships.map((membership) => (
                      <Link
                        key={membership.projectId}
                        to={`/projects/${membership.projectId}/members`}
                        className="inline-flex items-center gap-1.5"
                      >
                        <Badge tone="neutral" className="transition-colors hover:border-brand/40">
                          {membership.projectName}
                        </Badge>
                        <RoleBadge role={membership.role} />
                      </Link>
                    ))}
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  )
}
