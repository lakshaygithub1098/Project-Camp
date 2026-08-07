import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { queryClient } from '@/lib/query-client'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { router } from '@/routes'

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <RouterProvider router={router} />

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                // Inherit theme tokens so toasts match light and dark modes.
                style: {
                  background: 'rgb(var(--surface))',
                  color: 'rgb(var(--fg))',
                  border: '1px solid rgb(var(--border))',
                  fontSize: '0.875rem',
                  borderRadius: '0.625rem',
                  boxShadow: '0 10px 30px -10px rgb(0 0 0 / 0.25)',
                },
                success: { iconTheme: { primary: 'rgb(var(--success))', secondary: '#fff' } },
                error: {
                  duration: 5000,
                  iconTheme: { primary: 'rgb(var(--danger))', secondary: '#fff' },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
