CREATE TABLE `settings` (
	`studentId` text NOT NULL,
	`key` text NOT NULL,
	`valueJson` text NOT NULL,
	`updatedAt` integer NOT NULL,
	PRIMARY KEY(`studentId`, `key`)
);
