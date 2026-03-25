CREATE TABLE `feed_calendars` (
	`slug` text NOT NULL,
	`id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`startsAt` integer,
	`endsAt` integer,
	`location` text,
	`url` text,
	PRIMARY KEY(`slug`, `id`)
);
--> statement-breakpoint
CREATE TABLE `feed_notices` (
	`slug` text NOT NULL,
	`id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`content` text,
	`url` text,
	`createdAt` integer,
	`updatedAt` integer,
	`author` text,
	`thumbnail` text,
	`categoriesJson` text,
	`attachmentsJson` text,
	`metadataJson` text,
	PRIMARY KEY(`slug`, `id`)
);
--> statement-breakpoint
CREATE TABLE `feed_sites` (
	`slug` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`source` text,
	`itemCount` integer DEFAULT 0,
	`kind` text NOT NULL
);
