import { useState } from 'react'
import { NotebookPen, Pencil, Plus, Trash2 } from 'lucide-react'
import { useProjectContext } from '@/hooks/useProjectContext'
import { useCreateNote, useDeleteNote, useNotes, useUpdateNote } from '@/hooks/useNotes'
import { can } from '@/lib/permissions'
import {
  Avatar,
  Button,
  Card,
  CardBody,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Modal,
  SkeletonGrid,
  Textarea,
} from '@/components/ui'
import { displayName, formatRelative } from '@/lib/format'
import type { Note } from '@/types'

export default function ProjectNotes() {
  const { projectId, role } = useProjectContext()
  const notesQuery = useNotes(projectId)

  const createNote = useCreateNote(projectId)
  const updateNote = useUpdateNote(projectId)
  const deleteNote = useDeleteNote(projectId)

  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [content, setContent] = useState('')
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)

  const canManage = can.manageNotes(role)

  const openCreate = () => {
    setEditingNote(null)
    setContent('')
    setIsFormOpen(true)
  }

  const openEdit = (note: Note) => {
    setEditingNote(note)
    setContent(note.content)
    setIsFormOpen(true)
  }

  const handleSave = async () => {
    const trimmed = content.trim()
    if (!trimmed) return

    if (editingNote) {
      await updateNote.mutateAsync({ noteId: editingNote._id, content: trimmed })
    } else {
      await createNote.mutateAsync(trimmed)
    }

    setIsFormOpen(false)
  }

  const confirmDelete = async () => {
    if (!noteToDelete) return
    await deleteNote.mutateAsync(noteToDelete._id)
    setNoteToDelete(null)
  }

  const addButton = canManage ? (
    <Button leftIcon={<Plus className="h-4 w-4" aria-hidden />} onClick={openCreate}>
      Add note
    </Button>
  ) : null

  if (notesQuery.isError) {
    return (
      <ErrorState
        error={notesQuery.error}
        onRetry={() => void notesQuery.refetch()}
        title="Could not load notes"
      />
    )
  }

  if (notesQuery.isLoading) return <SkeletonGrid count={3} />

  const notes = notesQuery.data ?? []

  return (
    <>
      {notes.length > 0 && (
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </p>
          {addButton}
        </div>
      )}

      {notes.length === 0 ? (
        <EmptyState
          icon={<NotebookPen className="h-5 w-5" aria-hidden />}
          title="No notes yet"
          description={
            canManage
              ? 'Capture decisions, context and anything the team should not have to re-derive.'
              : 'Project admins have not added any notes yet.'
          }
          action={addButton}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <Card key={note._id} className="group flex h-full flex-col">
              <CardBody className="flex-1">
                <p className="whitespace-pre-wrap text-sm text-fg">{note.content}</p>
              </CardBody>

              <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
                <span className="flex min-w-0 items-center gap-2">
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
                </span>

                {canManage && (
                  <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => openEdit(note)}
                      className="rounded p-1.5 text-muted transition-colors hover:text-fg"
                      aria-label="Edit note"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteToDelete(note)}
                      className="rounded p-1.5 text-muted transition-colors hover:text-danger"
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingNote ? 'Edit note' : 'Add note'}
        closeOnOverlayClick={!createNote.isPending && !updateNote.isPending}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleSave()}
              isLoading={createNote.isPending || updateNote.isPending}
              disabled={!content.trim()}
            >
              {editingNote ? 'Save changes' : 'Add note'}
            </Button>
          </>
        }
      >
        <Textarea
          label="Note"
          rows={7}
          placeholder="Write anything the team should know…"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(noteToDelete)}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete note"
        message="This note will be permanently removed. This cannot be undone."
        isLoading={deleteNote.isPending}
      />
    </>
  )
}
