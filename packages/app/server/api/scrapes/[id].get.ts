import { getDb } from '../../db'
import { scrapeJobs, scrapeResults } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler((event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'Job ID required' })
  }

  const db = getDb()

  const job = db.select().from(scrapeJobs)
    .where(and(eq(scrapeJobs.id, id), eq(scrapeJobs.userId, user.id)))
    .get()

  if (!job) {
    throw createError({ statusCode: 404, message: 'Scrape job not found' })
  }

  const result = db.select().from(scrapeResults)
    .where(eq(scrapeResults.jobId, id))
    .get()

  return { job, result }
})
