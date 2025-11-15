CREATE TABLE `graduation_requirements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`requirement` integer,
	`calculation` real,
	`difference` real,
	`result` integer NOT NULL,
	`category` text NOT NULL,
	`lectures` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `graduation_requirements_general` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`isGraduatable` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `graduation_student` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`number` integer NOT NULL,
	`name` text NOT NULL,
	`grade` integer NOT NULL,
	`semester` integer NOT NULL,
	`status` text NOT NULL,
	`applyYear` integer NOT NULL,
	`applyType` text NOT NULL,
	`department` text NOT NULL,
	`majors` text NOT NULL,
	`auditDate` text NOT NULL,
	`graduationPoints` real NOT NULL,
	`completedPoints` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scholarships` (
	`year` integer NOT NULL,
	`semester` integer NOT NULL,
	`name` text NOT NULL,
	`receivedAmount` text NOT NULL,
	`receiveType` text,
	`status` text,
	`processedAt` text,
	`selectedAmount` text,
	`refundedAmount` text,
	`replacedAmount` text,
	`replacedBy` text,
	`dropReason` text,
	`note` text,
	`workedAt` text,
	PRIMARY KEY(`year`, `semester`, `name`)
);
--> statement-breakpoint
CREATE TABLE `student_information` (
	`applyYear` integer NOT NULL,
	`studentNumber` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`rrn` integer NOT NULL,
	`collage` text NOT NULL,
	`department` text NOT NULL,
	`major` text,
	`division` text,
	`grade` integer NOT NULL,
	`term` integer NOT NULL,
	`image` blob NOT NULL,
	`alias` text,
	`kanjiName` text,
	`email` text,
	`telNumber` text,
	`mobileNumber` text,
	`postCode` text,
	`address` text,
	`specificAddress` text,
	`isTransferStudent` integer NOT NULL,
	`applyDate` text NOT NULL,
	`appliedCollage` text NOT NULL,
	`appliedDepartment` text NOT NULL,
	`pluralMajor` text,
	`subMajor` text,
	`connectedMajor` text,
	`abeek` text
);
