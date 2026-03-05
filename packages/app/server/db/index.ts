import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema'
import { join, resolve } from 'path'
import { mkdirSync, existsSync } from 'fs'

let _db: ReturnType<typeof drizzle<typeof schema>>

export function getDb() {
  if (_db) return _db

  const config = useRuntimeConfig()
  const dataDir = config.dataDir || './data'
  const dbPath = join(dataDir, 'forgecrawl.sqlite')

  // Ensure data directory exists
  mkdirSync(dataDir, { recursive: true })

  const sqlite = new Database(dbPath)

  // Performance and safety pragmas
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('synchronous = NORMAL')
  sqlite.pragma('foreign_keys = ON')
  sqlite.pragma('busy_timeout = 5000')
  sqlite.pragma('cache_size = -64000')

  _db = drizzle(sqlite, { schema })

  // Auto-migrate on startup
  // In dev mode, CWD is packages/app/. In production, migrations are bundled.
  const migrationsPath = resolve('server/db/migrations')
  if (existsSync(migrationsPath)) {
    migrate(_db, { migrationsFolder: migrationsPath })
  }

  return _db
}
