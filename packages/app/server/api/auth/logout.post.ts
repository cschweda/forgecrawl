export default defineEventHandler((event) => {
  deleteCookie(event, 'forgecrawl_session', {
    path: '/',
  })

  return { success: true }
})
