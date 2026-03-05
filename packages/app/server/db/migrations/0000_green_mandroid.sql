CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`key_hash` text NOT NULL,
	`key_prefix` text NOT NULL,
	`last_used_at` text,
	`expires_at` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `app_config` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `scrape_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`url` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`job_type` text DEFAULT 'single' NOT NULL,
	`config` text,
	`started_at` text,
	`completed_at` text,
	`error_message` text,
	`pages_discovered` integer DEFAULT 0,
	`pages_completed` integer DEFAULT 0,
	`pages_failed` integer DEFAULT 0,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `scrape_results` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`markdown` text,
	`raw_html` text,
	`word_count` integer,
	`metadata` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`job_id`) REFERENCES `scrape_jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);