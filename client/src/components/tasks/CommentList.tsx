import { useState } from 'react'
import { MessageSquare, Send, Trash2 } from 'lucide-react'
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/useComments'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, Button, Skeleton, Textarea } from '@/components/ui'
import { displayName, formatRelative } from '@/lib/format'

/**
 * Comments have no backend route yet. When the endpoint is missing the panel
 * says so plainly instead of rendering a broken composer.
 */
export function CommentList({ projectId, taskId }: { projectId: string; taskId: string }) {
  const { user } = useAuth()
  const { comments, isLoading, isUnavailable } = useComments(projectId, taskId)
  const createComment = useCreateComment(projectId, taskId)
  const deleteComment = useDeleteComment(projectId, taskId)

  const [draft, setDraft] = useState('')

  if (isUnavailable) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
        <MessageSquare className="mx-auto h-5 w-5 text-subtle" aria-hidden />
        <p className="mt-2 text-sm text-muted">Comments are not available on this server yet.</p>
        <p className="mt-1 text-xs text-subtle">
          The UI is ready and will work once the comments endpoint exists.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }, (_, index) => (
          <Skeleton key={index} className="h-14" />
        ))}
      </div>
    )
  }

  const handleSubmit = async () => {
    const trimmed = draft.trim()
    if (!trimmed) return

    await createComment.mutateAsync(trimmed)
    setDraft('')
  }

  return (
    <div className="space-y-5">
      {comments.length === 0 ? (
        <p className="text-sm text-muted">No comments yet. Start the conversation.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => {
            const author = typeof comment.createdBy === 'object' ? comment.createdBy : null
            const isOwn = author?._id === user?._id

            return (
              <li key={comment._id} className="group flex gap-3">
                <Avatar
                  name={author ? displayName(author) : 'Unknown'}
                  src={author?.avatar?.url}
                  size="sm"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-fg">
                      {author ? displayName(author) : 'Unknown'}
                    </span>
                    <span className="text-xs text-subtle">{formatRelative(comment.createdAt)}</span>

                    {isOwn && (
                      <button
                        type="button"
                        onClick={() => deleteComment.mutate(comment._id)}
                        className="ml-auto rounded p-1 text-muted opacity-0 transition-opacity hover:text-danger focus:opacity-100 group-hover:opacity-100"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    )}
                  </div>

                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{comment.content}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault()
          void handleSubmit()
        }}
        className="space-y-2"
      >
        <Textarea
          rows={3}
          placeholder="Write a comment…"
          aria-label="New comment"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            isLoading={createComment.isPending}
            disabled={!draft.trim()}
            leftIcon={<Send className="h-3.5 w-3.5" aria-hidden />}
          >
            Comment
          </Button>
        </div>
      </form>
    </div>
  )
}
