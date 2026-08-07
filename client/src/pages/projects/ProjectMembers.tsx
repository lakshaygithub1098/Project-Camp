import { useState } from 'react'
import { UserPlus, Users } from 'lucide-react'
import { useProjectContext } from '@/hooks/useProjectContext'
import {
  useAddMember,
  useMembers,
  useRemoveMember,
  useUpdateMemberRole,
} from '@/hooks/useMembers'
import { useAuth } from '@/hooks/useAuth'
import { can } from '@/lib/permissions'
import { InviteMemberModal } from '@/components/members/InviteMemberModal'
import {
  Avatar,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  RoleBadge,
  Select,
  SkeletonList,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { ROLE_OPTIONS } from '@/lib/constants'
import { displayName, formatDate } from '@/lib/format'
import type { ProjectMember, UserRole } from '@/types'

export default function ProjectMembers() {
  const { projectId, role } = useProjectContext()
  const { user } = useAuth()
  const membersQuery = useMembers(projectId)

  const addMember = useAddMember(projectId)
  const updateRole = useUpdateMemberRole(projectId)
  const removeMember = useRemoveMember(projectId)

  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null)

  const canManage = can.manageMembers(role)

  const confirmRemove = async () => {
    if (!memberToRemove) return
    await removeMember.mutateAsync(memberToRemove.user._id)
    setMemberToRemove(null)
  }

  const inviteButton = canManage ? (
    <Button
      leftIcon={<UserPlus className="h-4 w-4" aria-hidden />}
      onClick={() => setIsInviteOpen(true)}
    >
      Add member
    </Button>
  ) : null

  if (membersQuery.isError) {
    return (
      <ErrorState
        error={membersQuery.error}
        onRetry={() => void membersQuery.refetch()}
        title="Could not load members"
      />
    )
  }

  if (membersQuery.isLoading) return <SkeletonList rows={4} />

  const members = membersQuery.data ?? []

  if (members.length === 0) {
    return (
      <>
        <EmptyState
          icon={<Users className="h-5 w-5" aria-hidden />}
          title="No members yet"
          description={
            canManage
              ? 'Add teammates by email so they can see this project and pick up work.'
              : 'Nobody else has been added to this project yet.'
          }
          action={inviteButton}
        />

        <InviteMemberModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          onSubmit={(values) => addMember.mutateAsync(values)}
          isSubmitting={addMember.isPending}
        />
      </>
    )
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {members.length} {members.length === 1 ? 'person has' : 'people have'} access
        </p>
        {inviteButton}
      </div>

      <Table>
        <THead>
          <TH>Member</TH>
          <TH className="hidden sm:table-cell">Username</TH>
          <TH className="hidden lg:table-cell">Joined</TH>
          <TH>Role</TH>
          {canManage && <TH className="text-right">Actions</TH>}
        </THead>

        <TBody>
          {members.map((member) => {
            const isSelf = member.user._id === user?._id
            const name = displayName(member.user)

            return (
              <TR key={member.user._id}>
                <TD>
                  <div className="flex items-center gap-3">
                    <Avatar name={name} src={member.user.avatar?.url} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-fg">
                        {name}
                        {isSelf && <span className="ml-1.5 text-xs text-subtle">(you)</span>}
                      </p>
                      {/* The members aggregation does not project email. */}
                      <p className="truncate text-xs text-muted sm:hidden">
                        @{member.user.username}
                      </p>
                    </div>
                  </div>
                </TD>

                <TD className="hidden text-sm text-muted sm:table-cell">@{member.user.username}</TD>

                <TD className="hidden text-sm text-muted lg:table-cell">
                  {formatDate(member.createdAt)}
                </TD>

                <TD>
                  {canManage && !isSelf ? (
                    <Select
                      aria-label={`Role for ${name}`}
                      options={ROLE_OPTIONS}
                      value={member.role}
                      disabled={updateRole.isPending}
                      onChange={(event) =>
                        updateRole.mutate({
                          userId: member.user._id,
                          role: event.target.value as UserRole,
                        })
                      }
                      className="h-8 w-auto min-w-[9rem] py-0 text-xs"
                    />
                  ) : (
                    <RoleBadge role={member.role} />
                  )}
                </TD>

                {canManage && (
                  <TD className="text-right">
                    {!isSelf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:bg-danger/10"
                        onClick={() => setMemberToRemove(member)}
                      >
                        Remove
                      </Button>
                    )}
                  </TD>
                )}
              </TR>
            )
          })}
        </TBody>
      </Table>

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSubmit={(values) => addMember.mutateAsync(values)}
        isSubmitting={addMember.isPending}
      />

      <ConfirmDialog
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        onConfirm={() => void confirmRemove()}
        title="Remove member"
        message={`${memberToRemove ? displayName(memberToRemove.user) : 'This person'} will lose access to this project. You can add them back later.`}
        confirmLabel="Remove"
        isLoading={removeMember.isPending}
      />
    </>
  )
}
