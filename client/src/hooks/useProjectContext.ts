import { useOutletContext } from 'react-router-dom'
import type { ProjectOutletContext } from '@/pages/projects/ProjectDetails'

/** Typed accessor for the context provided by the ProjectDetails shell. */
export function useProjectContext(): ProjectOutletContext {
  return useOutletContext<ProjectOutletContext>()
}
