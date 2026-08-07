import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Monitor, Palette } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader, ThemeToggle } from '@/components/common'
import { Button, Card, CardBody, CardHeader, ConfirmDialog } from '@/components/ui'
import { API_BASE_URL, APP_NAME } from '@/lib/constants'

export default function Settings() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [isSignOutOpen, setIsSignOutOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <PageHeader title="Settings" description="Appearance and session preferences." />

      <div className="max-w-3xl space-y-5">
        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <Palette className="h-4 w-4" aria-hidden />
                Appearance
              </span>
            }
            description="Choose a theme, or follow your operating system."
          />
          <CardBody>
            <ThemeToggle />
            <p className="mt-3 text-xs text-subtle">
              Your choice is saved in this browser and applied before the first paint, so there is no
              flash on reload.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <Monitor className="h-4 w-4" aria-hidden />
                Connection
              </span>
            }
            description="Where this app is sending its API requests."
          />
          <CardBody>
            <dl className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-muted">API base URL</dt>
                <dd className="font-mono text-xs text-fg">{API_BASE_URL}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">Application</dt>
                <dd className="text-fg">{APP_NAME}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-subtle">
              Change this by setting <span className="font-mono">VITE_API_URL</span> in your{' '}
              <span className="font-mono">.env</span> file.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Session" description="Sign out of this device." />
          <CardBody>
            <Button
              variant="secondary"
              leftIcon={<LogOut className="h-4 w-4" aria-hidden />}
              onClick={() => setIsSignOutOpen(true)}
            >
              Sign out
            </Button>
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
        onConfirm={() => void handleSignOut()}
        title="Sign out"
        message="You'll need to sign in again to access your projects."
        confirmLabel="Sign out"
        tone="primary"
        isLoading={isSigningOut}
      />
    </>
  )
}
