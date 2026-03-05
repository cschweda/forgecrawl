import { getDb } from '../db'
import { appConfig } from '../db/schema'
import { eq } from 'drizzle-orm'

export function isSetupComplete(): boolean {
  const db = getDb()
  const row = db.select().from(appConfig)
    .where(eq(appConfig.key, 'setup_complete'))
    .get()
  return !!row
}
