CREATE TABLE `student_academic_records` (
	`studentId` text NOT NULL,
	`sequence` integer NOT NULL,
	`startDate` text NOT NULL,
	`endDate` text NOT NULL,
	`year` text NOT NULL,
	`term` text NOT NULL,
	`category` text NOT NULL,
	`reason` text NOT NULL,
	`processDate` text NOT NULL,
	PRIMARY KEY(`studentId`, `sequence`)
);
