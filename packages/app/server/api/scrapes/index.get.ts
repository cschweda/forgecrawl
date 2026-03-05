import { getDb } from '../../db'
import { scrapeJobs, scrapeResults } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler((event) => {
  const user = event.context.user
  const db = getDb()

  const jobs = db.select({
    id: scrapeJobs.id,
    url: scrapeJobs.url,
    status: scrapeJobs.status,
    jobType: scrapeJobs.jobType,
    errorMessage: scrapeJobs.errorMessage,
    startedAt: scrapeJobs.startedAt,
    completedAt: scrapeJobs.completedAt,
    createdAt: scrapeJobs.createdAt,
  })
    .from(scrapeJobs)
    .where(eq(scrapeJobs.userId, user.id))
    .orderBy(desc(scrapeJobs.createdAt))
    .limit(50)
    .all()

  return { jobs }
})
