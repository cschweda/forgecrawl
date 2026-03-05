import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// App configuration (first-run detection, settings)
export const appConfig = sqliteTable('app_config', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).notNull(),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// Users (built-in auth)
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name'),
  role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// API Keys (Phase 4, but table created now for schema completeness)
export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull(),
  keyPrefix: text('key_prefix').notNull(),
  lastUsedAt: text('last_used_at'),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// Scrape Jobs
export const scrapeJobs = sqliteTable('scrape_jobs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  url: text('url').notNull(),
  status: text('status', {
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
  }).notNull().default('pending'),
  jobType: text('job_type', {
    enum: ['single', 'crawl', 'batch'],
  }).notNull().default('single'),
  config: text('config', { mode: 'json' }),
  startedAt: text('started_at'),
  completedAt: text('completed_at'),
  errorMessage: text('error_message'),
  pagesDiscovered: integer('pages_discovered').default(0),
  pagesCompleted: integer('pages_completed').default(0),
  pagesFailed: integer('pages_failed').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// Scrape Results
export const scrapeResults = sqliteTable('scrape_results', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobId: text('job_id').notNull().references(() => scrapeJobs.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  title: text('title'),
  markdown: text('markdown'),
  rawHtml: text('raw_html'),
  wordCount: integer('word_count'),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})
