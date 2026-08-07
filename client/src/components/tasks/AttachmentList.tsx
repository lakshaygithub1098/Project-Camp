import { Download, FileText, ImageIcon } from 'lucide-react'
import { formatBytes } from '@/lib/format'
import type { Attachment } from '@/types'

/** Renders task attachments, previewing images and listing everything else. */
export function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) {
    return <p className="text-sm text-muted">No attachments.</p>
  }

  return (
    <ul className="space-y-2">
      {attachments.map((attachment, index) => {
        const isImage = attachment.mimetype?.startsWith('image/')
        const fileName = decodeURIComponent(attachment.url.split('/').pop() ?? 'Attachment')

        return (
          <li key={attachment._id ?? `${attachment.url}-${index}`}>
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-lg border border-border p-2.5 transition-colors hover:border-brand/40 hover:bg-elevated"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-elevated text-muted"
                aria-hidden
              >
                {isImage ? (
                  <ImageIcon className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-fg group-hover:text-brand">
                  {fileName}
                </span>
                {attachment.size !== undefined && (
                  <span className="text-xs text-subtle">{formatBytes(attachment.size)}</span>
                )}
              </span>

              <Download
                className="h-3.5 w-3.5 shrink-0 text-subtle group-hover:text-brand"
                aria-hidden
              />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
