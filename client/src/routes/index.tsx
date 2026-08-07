import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'
import { PageLoader } from '@/components/ui'

// Route-level code splitting keeps the initial bundle small; each page loads
// on first visit behind a Suspense fallback.
const Landing = lazy(() => import('@/pages/Landing'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'))

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Projects = lazy(() => import('@/pages/projects/Projects'))
const ProjectDetails = lazy(() => import('@/pages/projects/ProjectDetails'))
const ProjectOverview = lazy(() => import('@/pages/projects/ProjectOverview'))
const ProjectTasks = lazy(() => import('@/pages/projects/ProjectTasks'))
const ProjectMembers = lazy(() => import('@/pages/projects/ProjectMembers'))
const ProjectNotes = lazy(() => import('@/pages/projects/ProjectNotes'))
const ProjectSettings = lazy(() => import('@/pages/projects/ProjectSettings'))
const TaskDetails = lazy(() => import('@/pages/tasks/TaskDetails'))
const Members = lazy(() => import('@/pages/Members'))
const Notes = lazy(() => import('@/pages/Notes'))
const Profile = lazy(() => import('@/pages/Profile'))
const Settings = lazy(() => import('@/pages/Settings'))
const NotFound = lazy(() => import('@/pages/NotFound'))

/** Wraps a lazy element in the shared Suspense fallback. */
function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: withSuspense(<Landing />),
  },

  // Auth pages, unavailable once signed in.
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: withSuspense(<Login />) },
          { path: '/register', element: withSuspense(<Register />) },
          { path: '/forgot-password', element: withSuspense(<ForgotPassword />) },
          { path: '/reset-password/:resetToken', element: withSuspense(<ResetPassword />) },
        ],
      },
    ],
  },

  // Email verification stays reachable whether or not you are signed in.
  {
    element: <AuthLayout />,
    children: [
      { path: '/verify-email/:verificationToken', element: withSuspense(<VerifyEmail />) },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: withSuspense(<Dashboard />) },
          { path: '/projects', element: withSuspense(<Projects />) },

          {
            path: '/projects/:projectId',
            element: withSuspense(<ProjectDetails />),
            children: [
              { index: true, element: withSuspense(<ProjectOverview />) },
              { path: 'tasks', element: withSuspense(<ProjectTasks />) },
              { path: 'members', element: withSuspense(<ProjectMembers />) },
              { path: 'notes', element: withSuspense(<ProjectNotes />) },
              { path: 'settings', element: withSuspense(<ProjectSettings />) },
            ],
          },

          // Task detail is a full page rather than a tab, so it sits outside
          // the ProjectDetails shell.
          { path: '/projects/:projectId/tasks/:taskId', element: withSuspense(<TaskDetails />) },

          { path: '/members', element: withSuspense(<Members />) },
          { path: '/notes', element: withSuspense(<Notes />) },
          { path: '/profile', element: withSuspense(<Profile />) },
          { path: '/settings', element: withSuspense(<Settings />) },
        ],
      },
    ],
  },

  { path: '/404', element: withSuspense(<NotFound />) },
  { path: '*', element: <Navigate to="/404" replace /> },
]

export const router = createBrowserRouter(routes)
