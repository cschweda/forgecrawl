export default defineNuxtRouteMiddleware(async (to) => {
  const { setupComplete, checkSetup, user, fetchUser } = useAuth()

  // Check setup status once per session
  if (setupComplete.value === null) {
    await checkSetup()
  }

  // Setup not complete — force to /setup
  if (!setupComplete.value) {
    if (to.path !== '/setup') {
      return navigateTo('/setup')
    }
    return
  }

  // Setup complete but visiting /setup — redirect home
  if (to.path === '/setup') {
    return navigateTo('/')
  }

  // Login page — allow through
  if (to.path === '/login') {
    return
  }

  // All other pages require auth
  if (!user.value) {
    await fetchUser()
  }

  if (!user.value) {
    return navigateTo('/login')
  }
})
