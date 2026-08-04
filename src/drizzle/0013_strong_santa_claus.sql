CREATE TABLE `course_information` (
	`studentId` text NOT NULL,
	`year` integer NOT NULL,
	`semester` integer NOT NULL,
	`code` text NOT NULL,
	`division` text NOT NULL,
	`name` text NOT NULL,
	`professor` text NOT NULL,
	`scheduleRoom` text NOT NULL,
	`lecture` text NOT NULL,
	`detail` text,
	PRIMARY KEY(`studentId`, `year`, `semester`, `code`, `division`)
);
--> statement-breakpoint
CREATE TABLE `course_syllabus` (
	`studentId` text NOT NULL,
	`year` integer NOT NULL,
	`semester` integer NOT NULL,
	`code` text NOT NULL,
	`data` text NOT NULL,
	PRIMARY KEY(`studentId`, `year`, `semester`, `code`)
);
