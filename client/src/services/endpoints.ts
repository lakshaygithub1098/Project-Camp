/**
 * Every backend URL in one place.
 *
 * Where the live backend and the PRD disagree, the comment says which one this
 * file follows and why. Keeping the decisions here means fixing a backend
 * mismatch is a one-line change rather than a hunt through service files.
 */
export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    /**
     * The PRD documents GET, but auth.routes.js registers this as POST.
     * Following the implementation so it works against the running server.
     */
    currentUser: '/auth/current-user',
    changePassword: '/auth/change-password',
    refreshToken: '/auth/refresh-token',
    verifyEmail: (token: string) => `/auth/verify-email/${encodeURIComponent(token)}`,
    forgotPassword: '/auth/forgot-password',
    resetPassword: (token: string) => `/auth/reset-password/${encodeURIComponent(token)}`,
    resendEmailVerification: '/auth/resend-email-verification',
    /** Not implemented on the backend yet; see profileService.updateProfile. */
    updateProfile: '/auth/update-profile',
  },

  projects: {
    list: '/projects',
    create: '/projects',
    detail: (projectId: string) => `/projects/${projectId}`,
    update: (projectId: string) => `/projects/${projectId}`,
    remove: (projectId: string) => `/projects/${projectId}`,
    members: (projectId: string) => `/projects/${projectId}/members`,
    addMember: (projectId: string) => `/projects/${projectId}/members`,
    member: (projectId: string, userId: string) => `/projects/${projectId}/members/${userId}`,
  },

  /**
   * The task router is not mounted in app.js and task.routes.js does not exist,
   * so these paths 404 today. They follow the PRD contract so the UI works as
   * soon as the router lands.
   */
  tasks: {
    list: (projectId: string) => `/tasks/${projectId}`,
    create: (projectId: string) => `/tasks/${projectId}`,
    detail: (projectId: string, taskId: string) => `/tasks/${projectId}/t/${taskId}`,
    update: (projectId: string, taskId: string) => `/tasks/${projectId}/t/${taskId}`,
    remove: (projectId: string, taskId: string) => `/tasks/${projectId}/t/${taskId}`,
    createSubtask: (projectId: string, taskId: string) =>
      `/tasks/${projectId}/t/${taskId}/subtasks`,
    updateSubtask: (projectId: string, subtaskId: string) => `/tasks/${projectId}/st/${subtaskId}`,
    removeSubtask: (projectId: string, subtaskId: string) => `/tasks/${projectId}/st/${subtaskId}`,
    /** Comments are in the product spec but absent from the PRD and backend. */
    comments: (projectId: string, taskId: string) => `/tasks/${projectId}/t/${taskId}/comments`,
    comment: (projectId: string, taskId: string, commentId: string) =>
      `/tasks/${projectId}/t/${taskId}/comments/${commentId}`,
  },

  /** Also not mounted on the backend yet; follows the PRD contract. */
  notes: {
    list: (projectId: string) => `/notes/${projectId}`,
    create: (projectId: string) => `/notes/${projectId}`,
    detail: (projectId: string, noteId: string) => `/notes/${projectId}/n/${noteId}`,
    update: (projectId: string, noteId: string) => `/notes/${projectId}/n/${noteId}`,
    remove: (projectId: string, noteId: string) => `/notes/${projectId}/n/${noteId}`,
  },

  healthcheck: '/healthcheck',
} as const
